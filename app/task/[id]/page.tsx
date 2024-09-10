import { AppTaskIdPage } from "@/components/app-task-id-page"   

export default function Page({ params }: { params: { id: string } }) {
  return <AppTaskIdPage params={params} />
}