import { GroupMemberManager } from "@/components/group-member-manager";

export default async function GroupDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  return <GroupMemberManager groupId={groupId} />;
}
