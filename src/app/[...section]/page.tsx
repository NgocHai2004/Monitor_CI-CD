import { notFound } from "next/navigation";
import { NAV } from "@/lib/nav";
import { EmptyState, Page } from "@/components/ui";

export function generateStaticParams() {
  return NAV.filter(
    (item) => item.href !== "/" && item.href !== "/server-monitor"
  ).map((item) => ({
    section: item.href.replace(/^\//, "").split("/"),
  }));
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string[] }>;
}) {
  const { section } = await params;
  if (!section || section[0] === "_not-found") {
    notFound();
  }

  const href = "/" + section.join("/");
  const item = NAV.find((nav) => nav.href === href);

  if (!item) notFound();

  return (
    <Page title={item.title} description={item.description}>
      <EmptyState>{item.empty}</EmptyState>
    </Page>
  );
}
