import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { AdminBlogManager } from "./blog-manager";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "admin") {
    redirect("/auth/signin?callbackUrl=/admin/blog");
  }

  return <AdminBlogManager />;
}
