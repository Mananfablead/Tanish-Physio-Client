import { Layout } from "@/components/layout/Layout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar,
  Clock,
  User,
  VideoIcon,
  Play,
  Plus,
  ChevronLeft,
  ChevronRight,
  MapPin,
  FileText,
  Users,
  CheckCircle,
  X,
  MoreHorizontal
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from "date-fns";
import { motion } from "framer-motion";

export default function SchedulePage() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isPastSessionsOpen, setIsPastSessionsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Mock data for sessions
  const mockUpcomingSessions = [
    {
      id: '1',
      therapist: { 
        name: 'Dr. Sarah Johnson', 
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face' 
      },
      date: new Date(new Date().setDate(new Date().getDate() + 1)),
      startTime: '10:00',
      endTime: '10:45',
      type: 'Video',
      status: 'Confirmed',
      location: 'Secure Video Call',
      relatedTo: 'Lower back pain recovery',
      notes: 'Initial assessment — please have any previous imaging ready.'
    },
    {
      id: '2',
      therapist: { 
        name: 'Dr. A. Lee', 
        avatar: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=80&h=80&fit=crop&crop=face' 
      },
      date: new Date(new Date().setDate(new Date().getDate() + 3)),
      startTime: '14:00',
      endTime: '14:45',
      type: 'Video',
      status: 'Confirmed',
      location: 'Secure Video Call',
      relatedTo: 'Gait analysis',
      notes: 'Reviewing progress on mobility exercises.'
    },
    {
      id: '3',
      therapist: { 
        name: 'Dr. Michael Chen', 
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face' 
      },
      date: new Date(new Date().setDate(new Date().getDate() + 7)),
      startTime: '09:30',
      endTime: '10:15',
      type: 'In-person',
      status: 'Confirmed',
      location: '123 Wellness Center, Suite 201',
      relatedTo: 'Knee rehabilitation',
      notes: 'Post-surgical recovery session.'
    }
  ];
  
  const mockPastSessions = [
    {
      id: '4',
      therapist: { 
        name: 'Dr. Emily Rodriguez', 
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face' 
      },
      date: new Date(new Date().setDate(new Date().getDate() - 5)),
      startTime: '11:00',
      endTime: '11:45',
      type: 'Video',
      status: 'Completed',
      location: 'Secure Video Call',
      relatedTo: 'Shoulder mobility',
      notes: 'Follow-up on exercises for rotator cuff strengthening.'
    },
    {
      id: '5',
      therapist: { 
        name: 'Dr. Michael Chen', 
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face' 
      },
      date: new Date(new Date().setDate(new Date().getDate() - 12)),
      startTime: '09:30',
      endTime: '10:15',
      type: 'In-person',
      status: 'Completed',
      location: '123 Wellness Center, Suite 201',
      relatedTo: 'Knee rehabilitation',
      notes: 'Post-surgical recovery session.'
    }
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => 
      direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1)
    );
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const getSessionsForDate = (date: Date) => {
    return mockUpcomingSessions.filter(session => 
      isSameDay(parseISO(session.date.toISOString()), date)
    );
  };

  const today = new Date();
  const upcomingSessions = mockUpcomingSessions;
  const pastSessions = mockPastSessions;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-primary/5 pt-16 pb-20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Schedule</h1>
              <p className="text-slate-600 font-medium">Manage your upcoming and past appointments</p>
            </div>
            <Button className="h-12 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-black px-6 shadow-md shadow-primary/20">
              <Plus className="h-5 w-5 mr-2" />
              Book New Session
            </Button>
          </div>
  
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Calendar */}
            <div className="lg:col-span-1">
              <Card className="bg-white/80 backdrop-blur rounded-2xl border border-primary/20 shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg font-black text-slate-900">Calendar</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-xl"
                      onClick={() => navigateMonth('prev')}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-xl"
                      onClick={() => navigateMonth('next')}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <h3 className="font-black text-slate-900">
                      {format(currentMonth, 'MMMM yyyy')}
                    </h3>
                  </div>
                    
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                      <div key={day} className="text-center text-xs font-black text-slate-500 py-1">
                        {day}
                      </div>
                    ))}
                  </div>
                    
                  <div className="grid grid-cols-7 gap-1">
                    {getDaysInMonth().map((day, index) => {
                      const isToday = isSameDay(day, today);
                      const isSelected = isSameDay(day, selectedDate);
                      const hasSession = getSessionsForDate(day).length > 0;
                        
                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedDate(day)}
                          className={`h-10 rounded-xl text-sm font-medium transition-all ${
                            isToday 
                              ? 'bg-primary/10 border border-primary/20 text-primary font-black' 
                              : isSelected 
                                ? 'bg-gradient-to-br from-primary to-accent text-white font-black shadow-md' 
                                : 'text-slate-700 hover:bg-slate-100'
                          } ${hasSession ? 'relative' : ''}`}
                        >
                          {format(day, 'd')}
                          {hasSession && (
                            <div className={`absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-primary'}`}></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
  
            {/* Right Column - Sessions List */}
            <div className="lg:col-span-2">
              <Card className="bg-white/80 backdrop-blur rounded-2xl border border-primary/20 shadow-sm overflow-hidden">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg font-black text-slate-900">
                        {format(selectedDate, 'MMMM d, yyyy')}
                      </CardTitle>
                      <p className="text-slate-500 text-sm font-medium mt-1">
                        {getSessionsForDate(selectedDate).length} session{getSessionsForDate(selectedDate).length !== 1 ? 's' : ''} scheduled
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {getSessionsForDate(selectedDate).length > 0 ? (
                    <div className="space-y-4">
                      {getSessionsForDate(selectedDate).map((session, index) => (
                        <motion.div 
                          key={session.id} 
                          className="border rounded-xl p-5 bg-white hover:shadow-md transition-all"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <div className="flex items-start gap-4">
                            <Avatar className="h-14 w-14 rounded-xl border border-slate-200">
                              <AvatarImage src={session.therapist.avatar} alt={session.therapist.name} />
                              <AvatarFallback className="bg-gradient-to-br from-primary/10 to-accent/10 text-primary rounded-xl">
                                {session.therapist.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                              
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-black text-slate-900 text-lg">{session.therapist.name}</h3>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="text-sm text-slate-600 flex items-center gap-1">
                                      <Clock className="h-4 w-4" /> {session.startTime} - {session.endTime}
                                    </span>
                                    <Badge variant="outline" className="text-xs rounded-full px-3 py-1 border-slate-300 text-slate-600 font-bold">
                                      {session.type}
                                    </Badge>
                                    <Badge className={`text-xs rounded-full px-3 py-1 ${
                                      session.status === 'Completed' 
                                        ? 'bg-gradient-to-r from-success to-emerald-500 text-white border-success/30' 
                                        : session.status === 'Confirmed'
                                          ? 'bg-gradient-to-r from-primary to-accent text-white border-primary/30'
                                          : 'bg-gradient-to-r from-warning to-amber-500 text-white border-warning/30'
                                    }`}>
                                      {session.status}
                                    </Badge>
                                  </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                                
                              <p className="text-sm text-slate-500 mt-3 flex items-start gap-1">
                                <User className="h-4 w-4 mt-0.5 text-slate-400" /> <span className="font-bold">Focus:</span> {session.relatedTo}
                              </p>
                                
                              {session.location && (
                                <p className="text-sm text-slate-500 mt-1 flex items-start gap-1">
                                  <MapPin className="h-4 w-4 mt-0.5 text-slate-400" /> {session.location}
                                </p>
                              )}
                            </div>
                          </div>
                            
                          <div className="flex gap-3 mt-5 justify-end">
                            {session.status === 'Completed' ? (
                              <Button variant="outline" className="h-10 rounded-xl text-sm font-bold border-slate-300 text-slate-600 hover:bg-primary/5 hover:text-primary">
                                <FileText className="h-4 w-4 mr-2" /> Session Summary
                              </Button>
                            ) : isSameDay(session.date, today) ? (
                              <Button className="h-10 rounded-xl text-sm font-bold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white">
                                <Play className="h-4 w-4 mr-2" /> Join Session
                              </Button>
                            ) : null}
                              
                            {session.status !== 'Completed' && (
                              <>
                                <Button variant="outline" className="h-10 rounded-xl text-sm font-bold border-slate-300 text-slate-600 hover:bg-primary/5 hover:text-primary">
                                  <Calendar className="h-4 w-4 mr-2" /> Reschedule
                                </Button>
                                <Button variant="outline" className="h-10 rounded-xl text-sm font-bold border-slate-300 text-slate-600 hover:bg-red-50 hover:text-red-600">
                                  <X className="h-4 w-4 mr-2" /> Cancel
                                </Button>
                              </>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 text-center space-y-4">
                      <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                        <Calendar className="h-10 w-10 text-primary/60" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-black text-slate-900">No sessions scheduled</h3>
                        <p className="text-slate-500 font-medium max-w-xs mx-auto">
                          You don't have any sessions scheduled for {format(selectedDate, 'MMMM d, yyyy')}.
                        </p>
                      </div>
                      <Button className="h-11 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold px-6 mt-4">
                        <Plus className="h-4 w-4 mr-2" /> Book Session
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
                
              {/* Upcoming vs Past Sessions */}
              <div className="mt-8">
                <div className="flex border-b border-slate-200 pb-3 mb-4">
                  <button 
                    onClick={() => setActiveTab('upcoming')}
                    className={`px-4 py-2 font-black text-sm rounded-t-lg transition-colors ${activeTab === 'upcoming' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" /> Upcoming Sessions
                    </div>
                  </button>
                  <button 
                    onClick={() => setActiveTab('past')}
                    className={`px-4 py-2 font-black text-sm rounded-t-lg transition-colors ${activeTab === 'past' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" /> Past Sessions
                    </div>
                  </button>
                </div>
                  
                <div className="space-y-4">
                  {activeTab === 'upcoming' ? (
                    upcomingSessions.length > 0 ? (
                      upcomingSessions.map((session, index) => (
                        <motion.div 
                          key={session.id} 
                          className="border rounded-xl p-5 bg-white hover:shadow-md transition-all"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <div className="flex items-start gap-4">
                            <Avatar className="h-14 w-14 rounded-xl border border-slate-200">
                              <AvatarImage src={session.therapist.avatar} alt={session.therapist.name} />
                              <AvatarFallback className="bg-gradient-to-br from-primary/10 to-accent/10 text-primary rounded-xl">
                                {session.therapist.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                              
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-black text-slate-900 text-lg">{session.therapist.name}</h3>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="text-sm text-slate-600 flex items-center gap-1">
                                      <Calendar className="h-4 w-4" /> {format(session.date, 'MMM d, yyyy')}
                                    </span>
                                    <span className="text-sm text-slate-600 flex items-center gap-1">
                                      <Clock className="h-4 w-4" /> {session.startTime} - {session.endTime}
                                    </span>
                                    <Badge variant="outline" className="text-xs rounded-full px-3 py-1 border-slate-300 text-slate-600 font-bold">
                                      {session.type}
                                    </Badge>
                                    <Badge className="bg-gradient-to-r from-primary to-accent text-white text-xs rounded-full px-3 py-1">
                                      {session.status}
                                    </Badge>
                                  </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                                
                              <p className="text-sm text-slate-500 mt-3 flex items-start gap-1">
                                <User className="h-4 w-4 mt-0.5 text-slate-400" /> <span className="font-bold">Focus:</span> {session.relatedTo}
                              </p>
                            </div>
                          </div>
                            
                          <div className="flex gap-3 mt-5 justify-end">
                            <Button variant="outline" className="h-10 rounded-xl text-sm font-bold border-slate-300 text-slate-600 hover:bg-primary/5 hover:text-primary">
                              <Calendar className="h-4 w-4 mr-2" /> Reschedule
                            </Button>
                            <Button variant="outline" className="h-10 rounded-xl text-sm font-bold border-slate-300 text-slate-600 hover:bg-red-50 hover:text-red-600">
                              <X className="h-4 w-4 mr-2" /> Cancel
                            </Button>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="py-12 text-center space-y-4">
                        <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                          <Clock className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900">No upcoming sessions</h3>
                        <p className="text-slate-500 font-medium">You have no upcoming appointments scheduled.</p>
                      </div>
                    )
                  ) : (
                    pastSessions.length > 0 ? (
                      pastSessions.map((session, index) => (
                        <motion.div 
                          key={session.id} 
                          className="border rounded-xl p-5 bg-white hover:shadow-md transition-all"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <div className="flex items-start gap-4">
                            <Avatar className="h-14 w-14 rounded-xl border border-slate-200">
                              <AvatarImage src={session.therapist.avatar} alt={session.therapist.name} />
                              <AvatarFallback className="bg-gradient-to-br from-success/10 to-emerald-500/10 text-success rounded-xl">
                                {session.therapist.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                              
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-black text-slate-900 text-lg">{session.therapist.name}</h3>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="text-sm text-slate-600 flex items-center gap-1">
                                      <Calendar className="h-4 w-4" /> {format(session.date, 'MMM d, yyyy')}
                                    </span>
                                    <span className="text-sm text-slate-600 flex items-center gap-1">
                                      <Clock className="h-4 w-4" /> {session.startTime} - {session.endTime}
                                    </span>
                                    <Badge className="bg-gradient-to-r from-success to-emerald-500 text-white text-xs rounded-full px-3 py-1">
                                      {session.status}
                                    </Badge>
                                  </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                                
                              <p className="text-sm text-slate-500 mt-3 flex items-start gap-1">
                                <User className="h-4 w-4 mt-0.5 text-slate-400" /> <span className="font-bold">Focus:</span> {session.relatedTo}
                              </p>
                            </div>
                          </div>
                            
                          <div className="flex gap-3 mt-5 justify-end">
                            <Button variant="outline" className="h-10 rounded-xl text-sm font-bold border-slate-300 text-slate-600 hover:bg-primary/5 hover:text-primary">
                              <FileText className="h-4 w-4 mr-2" /> Session Summary
                            </Button>
                            <Button variant="outline" className="h-10 rounded-xl text-sm font-bold border-slate-300 text-slate-600 hover:bg-primary/5 hover:text-primary">
                              <VideoIcon className="h-4 w-4 mr-2" /> Watch Recording
                            </Button>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="py-12 text-center space-y-4">
                        <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                          <CheckCircle className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900">No past sessions</h3>
                        <p className="text-slate-500 font-medium">You have no completed appointments to show.</p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}