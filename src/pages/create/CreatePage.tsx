import PageContainer from "../../components/layout/PageContainer"
import TrackList from "./components/TrackList"

export default function CreatePage() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <TrackList />
      </div>
    </PageContainer>
  )
}
