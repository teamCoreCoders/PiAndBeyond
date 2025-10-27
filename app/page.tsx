"use client";

import { useAuth } from "@/lib/auth-context";
import PublicNavbar from "@/components/PublicNavbar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Logo from "@/app/images/pi and beyond logo.png";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import {
  BookOpen,
  Users,
  FileText,
  Award,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function Home() {
  const { user, userData, loading } = useAuth();

  // Removed auto-redirect to allow logged-in users to view the homepage

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-gray-50 flex flex-col relative">
      {user && userData ? <Navbar /> : <PublicNavbar />}
      <div
        className="fixed inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <img src={Logo.src} alt="Watermark" className="w-[50%] opacity-100" />
      </div>
      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-blue-50/80 via-white/80 to-indigo-50/80 py-20 relative z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
              Welcome to <span className="text-blue-600">π & Beyond</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A new way to learn — with personal attention, logical reasoning,
              and conceptual clarity. At Pi & Beyond, we believe in building a
              solid foundation for tomorrow through individual focus and
              scientific understanding.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              {user && userData ? (
                <Link
                  href={
                    userData.role === "teacher"
                      ? "/teacher/dashboard"
                      : "/student/dashboard"
                  }
                >
                  <Button className="gap-2 px-6 py-3 text-lg bg-blue-600 text-white hover:bg-blue-700">
                    Go to Dashboard <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/studentAuth">
                    <Button className="gap-2 px-6 py-3 text-lg bg-blue-600 text-white hover:bg-blue-700">
                      Student Login <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/teacherAuth">
                    <Button className="px-6 py-3 text-lg border bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:bg-gray-200">
                      Teacher Login
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* FEATURES SECTION */}
      <section className="py-20 bg-white/80 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Strengths
            </h2>
            <p className="text-lg text-gray-600">
              Focused, personalized, and concept-driven education across major
              boards and curriculums.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Maths & Science (IB Board)</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Focused on developing critical thinking and conceptual
                  understanding for MYP Year 1–5 students. Lessons include
                  criteria-based learning, assessment, and homework designed to
                  enhance clarity and depth.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Maths (IGCSE & GCSE)</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Emphasizing subject-specific understanding and deeper
                  application-based problem-solving. Designed to strengthen
                  mathematical reasoning and real-world application.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Maths (ICSE & CBSE)</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Aligned with the Indian curriculum, our methods encourage
                  consistent practice, variety in problem solving, and mastery
                  of core mathematical concepts.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Personalized Attention</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Every student learns differently. Our tailored teaching
                  approach focuses on individual pace, grasping ability, and
                  learning interest — ensuring every student succeeds.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* FOR TEACHER & STUDENT SECTION
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                About Ms. Anupriya
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                The driving force behind Pi & Beyond. With a Master’s degree in
                Engineering from Mumbai University and over 20 years of teaching
                experience across leading universities in India and abroad, Ms.
                Anupriya Mam’s passion for education is unmatched.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Renowned educator and mentor since 2004</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Combines logical reasoning with conceptual teaching
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Expert in simplifying complex topics with practical clarity
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Dedicated to building confident, curious learners</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Choose Pi & Beyond
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Every concept we teach is aimed at helping students think
                independently, apply logic, and truly understand.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Personalized one-on-one teaching experience</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Concept-based learning, not rote memorization</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Scientific reasoning for long-term understanding</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Student engagement and measurable growth</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section> */}
      {/* ABOUT & WHY SECTION - Redesigned */}
      <section className="py-24 bg-gradient-to-b from-gray-50/80 to-white/80 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Intro */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet the Mind Behind Pi & Beyond
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Where passion for teaching meets innovation in learning — guided
              by Ms. Anupriya's expertise and the Pi & Beyond philosophy.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* About Ms. Anupriya */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all p-8">
              <h3 className="text-3xl font-semibold text-gray-900 mb-4">
                About Ms. Anupriya
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                The driving force behind Pi & Beyond. With a Master's degree in
                Engineering from Mumbai University and over 20 years of teaching
                experience across leading universities in India and abroad, Ms.
                Anupriya Mam’s passion for education is unmatched.
              </p>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Renowned educator and mentor since 2004
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Combines logical reasoning with conceptual teaching
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Expert in simplifying complex topics with practical clarity
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Dedicated to building confident, curious learners
                  </span>
                </li>
              </ul>
            </div>

            {/* Why Choose Pi & Beyond */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all p-8">
              <h3 className="text-3xl font-semibold text-gray-900 mb-4">
                Why Choose Pi & Beyond
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Every concept we teach is aimed at helping students think
                independently, apply logic, and truly understand their subjects.
              </p>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Personalized one-on-one teaching experience
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Concept-based learning, not rote memorization
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Scientific reasoning for long-term understanding
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Student engagement and measurable growth
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      {/* CALL TO ACTION
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Begin Your Journey</h2>
          <p className="text-xl mb-8 text-blue-100">
            Experience learning that goes beyond the ordinary. Build a
            foundation that lasts a lifetime with Pi & Beyond.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="gap-2">
              Join Now <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section> */}
      <Footer />
    </div>
  );
}
