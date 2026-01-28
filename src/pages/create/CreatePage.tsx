import PageContainer from "../../components/layout/PageContainer"
import TrackList from "./components/TrackList"
import MixerPanel from "./components/MixerPanel"

export default function CreatePage() {
  return (
    <PageContainer>
      <TrackList />
      <MixerPanel />
    </PageContainer>
  )
}
