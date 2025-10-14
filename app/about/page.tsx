import PublicNavbar from '@/components/PublicNavbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Eye, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />

      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">About Classroom</h1>
          <p className="text-xl text-gray-600">
            Empowering education through innovative technology
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-gray-600 mb-4">
              Classroom was born from a simple observation: traditional learning management systems were too complex,
              too expensive, and didn't meet the real needs of teachers and students. We set out to create a platform
              that would be intuitive, powerful, and accessible to everyone.
            </p>
            <p className="text-gray-600 mb-4">
              Today, Classroom serves thousands of teachers and students worldwide, helping them connect, collaborate,
              and achieve their educational goals. Our platform continues to evolve based on feedback from our community,
              ensuring we always provide the tools educators need.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h3>
                <p className="text-gray-600">
                  To democratize education by providing accessible, intuitive tools that enable teachers
                  to teach better and students to learn more effectively.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Vision</h3>
                <p className="text-gray-600">
                  A world where every student has access to quality education, and every teacher has
                  the tools they need to inspire and educate the next generation.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Values</h3>
                <p className="text-gray-600">
                  We believe in simplicity, accessibility, innovation, and putting the needs of educators
                  and students at the heart of everything we do.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose Classroom?</h2>

          <div className="space-y-6">
            <div className="border-l-4 border-blue-600 pl-6 py-2">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy to Use</h3>
              <p className="text-gray-600">
                Intuitive interface designed for users of all technical skill levels. Get started in minutes, not hours.
              </p>
            </div>

            <div className="border-l-4 border-green-600 pl-6 py-2">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Comprehensive Features</h3>
              <p className="text-gray-600">
                From class management to grading, assignments to study materials - everything you need in one place.
              </p>
            </div>

            <div className="border-l-4 border-purple-600 pl-6 py-2">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
              <p className="text-gray-600">
                Built with security in mind. Your data is encrypted, backed up, and always accessible when you need it.
              </p>
            </div>

            <div className="border-l-4 border-orange-600 pl-6 py-2">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Constantly Improving</h3>
              <p className="text-gray-600">
                We listen to our users and regularly add new features based on your feedback and needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
