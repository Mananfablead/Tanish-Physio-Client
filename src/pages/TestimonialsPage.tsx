import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { API_BASE_URL } from '@/lib/api';

// Helper function to truncate text to specified number of lines
const truncateText = (text: string, maxLines: number = 3) => {
  if (!text) return '';
  
  // Split text into words
  const words = text.split(' ');
  let truncated = '';
  let lineCount = 0;
  let currentLineLength = 0;
  
  // Approximate characters per line (adjust based on your design)
  const charsPerLine = 40;
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const wordLength = word.length + 1; // +1 for space
    
    if (currentLineLength + wordLength > charsPerLine) {
      lineCount++;
      currentLineLength = wordLength;
      if (lineCount >= maxLines) {
        truncated += '...';
        break;
      }
      truncated += ' ' + word;
    } else {
      truncated += (i > 0 ? ' ' : '') + word;
      currentLineLength += wordLength;
    }
  }
  
  return truncated || text;
};
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
  video?: string; // Optional video URL
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
      {/* Header Section with Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-4 pb-8">
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
        
       <div className="container relative z-10 text-center space-y-4 px-4 max-w-6xl mx-auto py-8">
  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mb-4 leading-snug">
    Patient Experiences
  </h1>

  <p className="text-sm md:text-base text-slate-600 mb-8 max-w-2xl mx-auto">
    Real stories from individuals who achieved better mobility and lasting recovery through expert physiotherapy care.
  </p>
</div>

      </div>
      
      <div className="container py-10  mx-auto">

        {testimonials.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto bg-gray-50 rounded-xl p-8 border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">No testimonials available</h2>
              <p className="text-gray-600">Check back later for patient stories.</p>
            </div>
          </div>
        ) : (
          <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {testimonials.map((testimonial) => (
              testimonial.video ? (
                // Video testimonial card
                <Card key={testimonial._id} className="h-full flex flex-col border border-gray-200 shadow-sm bg-gradient-to-br from-primary/5 to-white rounded-2xl overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="p-0">
                    <div className="aspect-video bg-black rounded-t-2xl overflow-hidden">
                      <video 
                        src={`${testimonial.video.startsWith('http') ? testimonial.video : `${API_BASE_URL.replace('/api', '')}${testimonial.video}`}`} 
                        controls 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6 flex-grow flex flex-col">
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
                      
                      <div className="mb-4 flex-grow">
                        <p className="text-sm font-medium text-primary mb-1">Problem Addressed:</p>
                        <p className="text-gray-600 text-sm">{testimonial.problem}</p>
                      </div>
                      
                      {/* Truncated content for video testimonials */}
                      <div className="mb-4">
                        <blockquote className="text-gray-700 italic leading-relaxed text-sm">
                          "{truncateText(testimonial.content, 3)}"
                        </blockquote>
                      </div>
                      
                      <div className="flex items-center pt-4 border-t border-gray-100 mt-auto">
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
                  </div>
                </Card>
              ) : (
                // Text testimonial card
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
              )
            ))}
          </div>
        </div>
        )}
      </div>
    </Layout>
  );
};

export default TestimonialsPage;