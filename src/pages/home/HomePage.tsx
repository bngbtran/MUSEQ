import PageContainer from "../../components/layout/PageContainer"
import HeroPlayer from "./components/HeroPlayer"
import FeaturedTrack from "./components/FeaturedTrack"

export default function HomePage() {
  return (
    <PageContainer>
      <HeroPlayer />
      <FeaturedTrack />
    </PageContainer>
  )
}
