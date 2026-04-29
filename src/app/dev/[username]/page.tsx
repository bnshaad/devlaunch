import { PublicPortfolioPageClient } from "@/app/dev/[username]/PublicPortfolioPageClient";

type PublicPortfolioPageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function PublicPortfolioPage({
  params
}: PublicPortfolioPageProps) {
  const { username } = await params;

  return <PublicPortfolioPageClient username={username} />;
}
