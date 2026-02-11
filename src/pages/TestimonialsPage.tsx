import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarIcon, Quote } from 'lucide-react';
import { getFeaturedTestimonials } from '@/lib/api';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

interface Testimonial {
  _id: string;
  content: string;
  problem: string;
  userId: {
    name: string;
    email: string;
    profilePicture: string;
  };
  rating: number;
  createdAt: string;
}

const TestimonialsPage: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await getFeaturedTestimonials();
        if (response.data.success) {
          setTestimonials(response.data.data);
        } else {
          setError('Failed to fetch testimonials');
        }
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setError('Error fetching testimonials');
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <Layout>
        <div className="container py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Testimonials</h1>
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <h2 className="text-2xl font-semibold text-red-700 mb-4">Error Loading Testimonials</h2>
              <p className="text-gray-700">{error}</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-10">
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">What Our Patients Say</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Hear from our patients about their journey to recovery and improved quality of life.
          </p>
        </div>

        {testimonials.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto bg-gray-50 rounded-xl p-8 border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">No testimonials available</h2>
              <p className="text-gray-600">Check back later for patient stories.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {testimonials.map((testimonial) => (
              <Card key={testimonial._id} className="h-full flex flex-col border border-gray-200 shadow-sm bg-gradient-to-br from-primary/5 to-white rounded-2xl overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Quote className="h-8 w-8 text-primary opacity-70" />
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(testimonial.rating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600 font-medium">
                        {testimonial.rating?.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-primary mb-1">Problem Addressed:</p>
                    <p className="text-gray-600 text-sm">{testimonial.problem}</p>
                  </div>
                  
                  <blockquote className="text-gray-700 italic mb-6 leading-relaxed text-lg">
                    "{testimonial.content}"
                  </blockquote>
                  
                  <div className="flex items-center mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                      {testimonial.userId?.profilePicture ? (
                        <Avatar className="h-12 w-12 border-2 border-white shadow">
                          <AvatarImage 
                            src={`data:image/jpeg;base64,${testimonial.userId.profilePicture}`} 
                            alt={testimonial.userId.name} 
                          />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {testimonial.userId.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <Avatar className="h-12 w-12 border-2 border-white shadow bg-primary/10 text-primary font-semibold">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {testimonial.userId?.name.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.userId?.name || 'Anonymous'}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(testimonial.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TestimonialsPage;