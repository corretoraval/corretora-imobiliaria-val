"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface PropertyMapInnerProps {
  latitude: number;
  longitude: number;
  visibility: "EXATA" | "APROXIMADA";
  title: string;
  addressLabel?: string;
}

export default function PropertyMapInner({
  latitude,
  longitude,
  visibility,
  title,
  addressLabel,
}: PropertyMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Se já houver um mapa instanciado, destrói antes de recriar
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const zoomLevel = visibility === "EXATA" ? 16 : 14;

    const map = L.map(mapContainerRef.current, {
      center: [latitude, longitude],
      zoom: zoomLevel,
      scrollWheelZoom: false, // evita interceptar o scroll da página acidentalmente
    });

    mapInstanceRef.current = map;

    // Tile Layer OpenStreetMap com estilo limpo
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    if (visibility === "EXATA") {
      // Pin elegante estilizado com as cores do projeto (Ametista e Ouro)
      const customPinIcon = L.divIcon({
        className: "custom-property-pin",
        html: `
          <div style="
            position: relative;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #35104f 0%, #4a1768 100%);
            border: 2.5px solid #d8bd82;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg) translate(0, -6px);
            box-shadow: 0 4px 14px rgba(53, 16, 79, 0.4);
          ">
            <svg style="transform: rotate(45deg); width: 18px; height: 18px; color: #f8f5ef;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([latitude, longitude], {
        icon: customPinIcon,
        title,
      }).addTo(map);

      const popupContent = `
        <div style="font-family: inherit; font-size: 13px; color: #221c1f; line-height: 1.4; padding: 4px;">
          <strong style="color: #35104f; display: block; font-size: 14px; margin-bottom: 2px;">${title}</strong>
          ${addressLabel ? `<span style="color: #645e5a;">${addressLabel}</span>` : ""}
        </div>
      `;
      marker.bindPopup(popupContent);
    } else {
      // Localização aproximada: desenha círculo suave representando a região/bairro
      const circle = L.circle([latitude, longitude], {
        radius: 650, // raio de ~650m
        color: "#35104f",
        weight: 1.5,
        opacity: 0.7,
        fillColor: "#b58a3a",
        fillOpacity: 0.2,
        dashArray: "6, 6",
      }).addTo(map);

      const popupContent = `
        <div style="font-family: inherit; font-size: 13px; color: #221c1f; line-height: 1.4; padding: 4px;">
          <strong style="color: #35104f; display: block; font-size: 14px; margin-bottom: 2px;">Localização aproximada</strong>
          <span style="color: #645e5a;">Por segurança e privacidade, a localização exata é informada no atendimento.</span>
        </div>
      `;
      circle.bindPopup(popupContent);
    }

    // Invalida o tamanho para renderizar corretamente após montar
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, visibility, title, addressLabel]);

  return (
    <div
      ref={mapContainerRef}
      className="h-[320px] w-full sm:h-[400px] z-0 rounded-2xl overflow-hidden"
    />
  );
}
