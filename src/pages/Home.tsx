import React, { useEffect } from "react"
import Header from "../components/Layout/Header"
import Footer from "../components/Layout/Footer"

const HeroSection = React.lazy(() => import("../components/Home/HeroSection"))
const FeatureCards = React.lazy(() => import("../components/Home/FeatureCards"))
const PopularAlgorithms = React.lazy(() => import("../components/Home/PopularAlgorithms"))
const TutorialModal = React.lazy(() => import("../components/Modals/TutorialModal"))

const SectionLoading = () => (
  <div className="flex justify-center py-16">
    <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
  </div>
)

const Home: React.FC = () => {
  useEffect(() => {
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <React.Suspense fallback={<SectionLoading />}>
          <HeroSection />
        </React.Suspense>
        <React.Suspense fallback={<SectionLoading />}>
          <FeatureCards />
        </React.Suspense>
        <React.Suspense fallback={<SectionLoading />}>
          <PopularAlgorithms />
        </React.Suspense>
      </main>

      <Footer />
      
      <React.Suspense fallback={null}>
        <TutorialModal />
      </React.Suspense>
    </div>
  )
}

export default Home
