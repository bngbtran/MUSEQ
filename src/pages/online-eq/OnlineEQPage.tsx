import PageContainer from "../../components/layout/PageContainer"
import TrackUploader from "./components/TrackUploader"
import EqPanel from "./components/EqPanel"
import EqVisualizer from "./components/EqVisualizer"

export default function OnlineEQPage() {
  return (
    <PageContainer>
      <TrackUploader />
      <EqPanel />
      <EqVisualizer />
    </PageContainer>
  )
}
