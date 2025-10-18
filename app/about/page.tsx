import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Eye, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />

      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            About Pi & Beyond
          </h1>
          <p className="text-xl text-gray-600">
            Building strong foundations through personal attention, logic, and
            scientific reasoning.
          </p>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-gray-600 mb-4">
              Pi & Beyond was founded with a simple yet powerful belief — that
              true learning happens when every student receives individual
              attention and is encouraged to think logically and scientifically.
              We go beyond traditional teaching to build conceptual clarity and
              confidence in every learner.
            </p>
            <p className="text-gray-600 mb-4">
              The institute is led by <strong>Ms. Anupriya Mam</strong>, a
              passionate educator with over 20 years of teaching experience. A
              Master’s degree holder in Engineering from Mumbai University, she
              has taught at leading engineering universities across India and
              abroad. Her innovative approach, deep subject knowledge, and
              mentoring skills have inspired hundreds of students to not just
              learn — but truly understand.
            </p>
          </div>
        </div>
      </section>

      {/* MISSION - VISION - VALUES */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center shadow-md hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Our Mission
                </h3>
                <p className="text-gray-600">
                  To nurture logical, curious, and confident learners by
                  providing personalised attention and concept-based teaching
                  that strengthens the foundation of every student.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-md hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Our Vision
                </h3>
                <p className="text-gray-600">
                  To become a beacon of excellence in conceptual learning —
                  where students think independently, reason scientifically, and
                  build a solid foundation for their future.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-md hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Our Philosophy
                </h3>
                <p className="text-gray-600">
                  Education should go beyond memorisation. At Pi & Beyond, we
                  focus on understanding each student’s learning needs and
                  adapting our teaching to bring out their best potential.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE SECTION */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Why Choose Pi & Beyond?
          </h2>

          <div className="space-y-6">
            <div className="border-l-4 border-blue-600 pl-6 py-2">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Personalised Attention
              </h3>
              <p className="text-gray-600">
                Every student learns differently — our individual focus ensures
                their pace, interest, and grasping ability are always respected.
              </p>
            </div>

            <div className="border-l-4 border-green-600 pl-6 py-2">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Conceptual Clarity
              </h3>
              <p className="text-gray-600">
                We strengthen the core understanding of Mathematics and Science
                through reasoning, logic, and real-world examples.
              </p>
            </div>

            <div className="border-l-4 border-purple-600 pl-6 py-2">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Board-Specific Expertise
              </h3>
              <p className="text-gray-600">
                Specialised programs for IB, IGCSE, GCSE, ICSE, and CBSE boards
                — each designed to build critical thinking and problem-solving
                skills.
              </p>
            </div>

            <div className="border-l-4 border-orange-600 pl-6 py-2">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Proven Experience
              </h3>
              <p className="text-gray-600">
                With over two decades of teaching experience, Ms. Anupriya Mam
                has successfully guided students across the world to academic
                excellence.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
