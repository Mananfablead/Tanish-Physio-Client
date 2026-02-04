import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Layout } from '../components/layout/Layout';
import { Heart, Award, Users, Shield, Activity, Stethoscope, User, Clock } from 'lucide-react';
import { fetchAboutPublic, setCmsAbout } from '../store/slices/cmsSlice';
import { AppDispatch, RootState, useAppDispatch } from '../store';

export default function AboutUsPage() {
  const dispatch = useAppDispatch();
  const { about, loading, error } = useSelector((state: RootState) => state.cms);

  useEffect(() => {
    dispatch(fetchAboutPublic());
  }, [dispatch]);

  // Use CMS data if available, otherwise fall back to hardcoded values
  const title = about?.title || "About Us";
  const description = about?.description || "Learn more about our mission, values, and commitment to your wellness journey";
  const mission = about?.mission || "At Tanish Physio, our mission is to provide accessible, high-quality physiotherapy services that empower individuals to achieve optimal physical wellness from the comfort of their own homes. We believe that exceptional care should be convenient, personalized, and available to everyone, regardless of their location or mobility constraints.";
  const foundingStory = about?.foundingStory || "Founded by Dr. Khushboo, Tanish Physio was born out of a vision to revolutionize the way people access physiotherapy services. With years of experience in the field, Dr. Khushboo recognized the challenges many individuals face in attending in-person sessions due to busy schedules, transportation issues, or mobility limitations. This led to the creation of our innovative platform that combines professional expertise with cutting-edge technology. Today, we continue to expand our reach and improve our services to help more people achieve their health and wellness goals from the comfort of their own homes.";
  const teamInfo = about?.teamInfo || "Our team consists of licensed and experienced physiotherapists who are passionate about helping patients achieve their health goals. Each member of our team undergoes a rigorous selection process and participates in ongoing professional development to ensure they provide the best possible care. Our clinical team brings together diverse expertise in various specialties of physiotherapy, ensuring that we can address a wide range of conditions and needs.";
  
  // Use CMS values if available, otherwise fall back to hardcoded values
  // The CMS values might be stored as a stringified array, so we need to parse it
  let cmsValues: string[] = [];
  if (about?.values && Array.isArray(about.values)) {
    // If it's already an array of strings
    cmsValues = about.values as string[];
  } else if (about?.values && typeof about.values[0] === 'string') {
    // If it's a string that represents an array, try to parse it
    try {
      const parsedValue = JSON.parse(about.values[0]);
      if (Array.isArray(parsedValue)) {
        cmsValues = parsedValue;
      } else {
        cmsValues = ["Compassion", "Excellence", "Accessibility", "Integrity", "Innovation"];
      }
    } catch {
      // If parsing fails, use default values
      cmsValues = ["Compassion", "Excellence", "Accessibility", "Integrity", "Innovation"];
    }
  } else {
    cmsValues = ["Compassion", "Excellence", "Accessibility", "Integrity", "Innovation"];
  }
  
  const defaultIcons = [Heart, Award, Activity, Shield, Stethoscope];
  
  const values = cmsValues.map((value, index) => ({
    icon: defaultIcons[index % defaultIcons.length],
    title: value,
    description: getDefaultValueDescription(value)
  }));
  
  const services = [
    { icon: Activity, name: "Orthopedic rehabilitation" },
    { icon: Stethoscope, name: "Neurological physiotherapy" },
    { icon: User, name: "Pediatric physiotherapy" },
    { icon: Clock, name: "Sports injury rehabilitation" },
    { icon: Award, name: "Post-surgical recovery" },
    { icon: Heart, name: "Chronic pain management" },
    { icon: Shield, name: "Posture correction and ergonomic advice" },
    { icon: Users, name: "Preventive care programs" }
  ];
  
  // Helper function to get default descriptions
  function getDefaultValueDescription(value: string) {
    const descriptions: Record<string, string> = {
      "Compassion": "We approach each patient with empathy and understanding, recognizing the unique challenges they face on their wellness journey.",
      "Excellence": "We maintain the highest standards of care, continuously updating our knowledge and techniques to provide the most effective treatments.",
      "Accessibility": "We believe quality physiotherapy should be available to everyone, which is why we've made our services accessible online.",
      "Integrity": "We maintain the highest ethical standards in all our interactions, ensuring transparency and trust with our patients.",
      "Innovation": "We embrace technology to enhance the therapeutic experience and improve patient outcomes."
    };
    
    return descriptions[value] || "Core value description";
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
        {/* Loading indicator */}
        {loading && (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-2 text-muted-foreground">Loading about us information...</p>
          </div>
        )}
        
    
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent mb-4">
            {title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>
        </div>
        
        {/* Mission Section */}
        <div className="bg-card rounded-2xl border p-8 mb-16 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <div className="bg-primary/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-foreground">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {mission}
              </p>
            </div>
            <div className="md:w-1/2">
              <div className="bg-gradient-to-br from-primary/10 to-green-500/10 rounded-xl p-8 border">
                {about?.images && about.images.length > 0 ? (
                  <img 
                    src={about.images[0]} 
                    alt="Mission" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-green-500/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Activity className="h-12 w-12 text-primary mx-auto mb-4" />
                      <p className="text-muted-foreground">Patient-centered care at your fingertips</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Story Section */}
        <div className="mb-16">
          <div className="flex flex-col md:flex-row-reverse items-center gap-8">
            <div className="md:w-1/2">
              <div className="bg-gradient-to-br from-primary/10 to-green-500/10 rounded-xl p-8 border">
                {about?.images && about.images.length > 1 ? (
                  <img 
                    src={about.images[1]} 
                    alt="Our Story" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-green-500/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                      <p className="text-muted-foreground">Innovation meets healthcare excellence</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="bg-primary/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-foreground">Our Story</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                {foundingStory.split('. ').slice(0, 2).map((sentence, i) => (
                  <React.Fragment key={i}>
                    {sentence}{sentence && '. '}
                  </React.Fragment>
                ))}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {foundingStory.split('. ').slice(2).join('. ')}
              </p>
            </div>
          </div>
        </div>
        
        {/* Values Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Our Core Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide our commitment to excellence in patient care
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-card rounded-xl border p-6 hover:shadow-md transition-shadow duration-300"
              >
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Team Section */}
        <div className="bg-card rounded-2xl border p-8 mb-16 shadow-sm">
          <div className="text-center mb-12">
            <div className="bg-primary/10 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-foreground">Our Team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Led by Dr. Khushboo, our team consists of licensed and experienced physiotherapists who are passionate about helping patients achieve their health goals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-lg text-muted-foreground mb-4">
                {teamInfo}
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-green-500/10 rounded-xl p-8 border">
              {about?.images && about.images.length > 2 ? (
                <img 
                  src={about.images[2]} 
                  alt="Our Team" 
                  className="w-full h-full object-cover rounded-lg aspect-square"
                />
              ) : (
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-green-500/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Users className="h-16 w-16 text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">Expert Physiotherapy Team</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Services Section */}
        <div className="mb-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Our Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive physiotherapy services designed to address various conditions and promote overall wellness
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((service, index) => (
              <div 
                key={index}
                className="bg-card rounded-lg border p-4 flex items-center gap-3 hover:shadow-sm transition-shadow duration-300"
              >
                <div className="bg-primary/10 p-2 rounded-lg">
                  <service.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-foreground font-medium">{service.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
}