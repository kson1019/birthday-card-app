import GoalDetailPage from "@/components/goals/GoalDetailPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GoalDetailPage goalId={id} />;
}
