import React, { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, User, Save, Info, LogOut, Trash2, Gamepad2, Settings as SettingsIcon, Palette } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Country } from 'country-state-city';
import { showWelcomeNotification } from '@/lib/utils';
import { tmdbApi } from '@/services/tmdb';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PreferenceEditor } from '@/components/PreferenceEditor';
import { supabase } from '@/integrations/supabase/client';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Separator } from '@/components/ui/separator';

const Settings: React.FC = () => {
  const { user, setUser, clearUser } = useUser();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(user);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
    setFormData(user);
  }, [user, navigate]);

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      if (notificationPermission === 'granted') {
        setFormData(prev => prev ? { ...prev, notifications_enabled: true } : null);
        toast.info("Notifications are already enabled.");
      } else if (notificationPermission === 'denied') {
        toast.error('Notifications are blocked', {
          description: 'Please enable them in your browser settings to receive alerts.',
        });
      } else if (notificationPermission === 'default') {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        if (permission === 'granted') {
          setFormData(prev => prev ? { ...prev, notifications_enabled: true } : null);
          toast.success('Notifications enabled!');
          showWelcomeNotification();
        } else {
          toast.error('Notification permission denied.');
        }
      }
    } else {
      setFormData(prev => prev ? { ...prev, notifications_enabled: false } : null);
      toast.info("Notifications disabled in app settings.");
    }
  };

  const handleSave = () => {
    if (formData) {
      setUser(formData);
      toast.success('Settings saved successfully!');
    }
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearUser();
    navigate('/');
    toast.info("You have been logged out.");
  }

  const handleRemoveFromNotificationList = (id: number, type: 'movie' | 'series') => {
    if (formData) {
      const updatedList = formData.notification_list.filter(item => !(item.id === id && item.type === type));
      setFormData({ ...formData, notification_list: updatedList });
    }
  };

  if (!formData) {
    return null;
  }

  const countryName = Country.getCountryByCode(formData.location.country)?.name || formData.location.country;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')} 
              className="flex items-center gap-2 hover:bg-muted"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-primary" />
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-[hsl(var(--neon-pink))] bg-clip-text text-transparent">
              Settings
            </h1>
          </div>

          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Appearance Section */}
          <Card className="overflow-hidden border-border/50 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-[hsl(var(--neon-pink))]/5 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Palette className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Appearance</CardTitle>
                  <CardDescription>Customize how the app looks</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <Label className="text-base font-medium">Theme</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose between light, dark, or system theme
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>

          {/* Profile & Notifications Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            
            {/* Profile Information */}
            <Card className="overflow-hidden border-border/50 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-[hsl(var(--neon-pink))]/5 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Profile Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                    <Input 
                      id="name" 
                      value={formData.name} 
                      onChange={(e) => setFormData(p => p ? {...p, name: e.target.value} : null)}
                      className="bg-input/50 border-border focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={(e) => setFormData(p => p ? {...p, email: e.target.value} : null)}
                      className="bg-input/50 border-border focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Country</Label>
                  <Input 
                    value={countryName} 
                    disabled 
                    className="bg-muted/50 border-border text-muted-foreground"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Age</Label>
                    <Input 
                      value={formData.age} 
                      disabled 
                      className="bg-muted/50 border-border text-muted-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Gender</Label>
                    <Input 
                      value={formData.gender} 
                      className="capitalize bg-muted/50 border-border text-muted-foreground" 
                      disabled 
                    />
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Content Preferences</Label>
                    <PreferenceEditor 
                      user={formData} 
                      onUpdate={(updatedUser) => setFormData(updatedUser)} 
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Movies</p>
                      <div className="flex flex-wrap gap-1.5">
                        {formData.interests.movies.length > 0 ? formData.interests.movies.map(genre => (
                          <Badge key={genre} variant="secondary" className="text-xs px-2 py-0.5">
                            {genre}
                          </Badge>
                        )) : (
                          <span className="text-xs text-muted-foreground">No genres selected</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-sm font-medium text-muted-foreground mb-2">TV Series</p>
                      <div className="flex flex-wrap gap-1.5">
                        {formData.interests.series.length > 0 ? formData.interests.series.map(genre => (
                          <Badge key={genre} variant="secondary" className="text-xs px-2 py-0.5">
                            {genre}
                          </Badge>
                        )) : (
                          <span className="text-xs text-muted-foreground">No genres selected</span>
                        )}
                      </div>
                    </div>
                    
                    {(formData.languages.length > 0 || formData.industries.length > 0) && (
                      <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Filters</p>
                        <div className="flex flex-wrap gap-1.5">
                          {[...formData.languages, ...formData.industries].map(pref => (
                            <Badge key={pref} variant="outline" className="text-xs px-2 py-0.5">
                              {pref}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications Card */}
            <Card className="overflow-hidden border-border/50 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-[hsl(var(--neon-pink))]/5 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Notifications</CardTitle>
                    <CardDescription>Manage how you receive alerts</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="notifications-switch" className="text-base font-medium">
                        Enable Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive browser notifications for new releases
                      </p>
                    </div>
                    <Switch
                      id="notifications-switch"
                      checked={formData.notifications_enabled && notificationPermission === 'granted'}
                      onCheckedChange={handleNotificationToggle}
                      disabled={notificationPermission === 'denied'}
                    />
                  </div>
                  
                  {notificationPermission === 'denied' && (
                    <div className="flex items-start gap-3 mt-4 p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                      <Info className="w-4 h-4 mt-0.5 shrink-0" />
                      <p className="text-sm">
                        Notifications are blocked. Enable them in your browser settings to receive alerts.
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    Saved for Notifications
                  </h4>
                  <ScrollArea className="h-[280px] pr-2">
                    <div className="space-y-3">
                      {formData.notification_list.length > 0 ? formData.notification_list.map(item => (
                        <div 
                          key={`${item.type}-${item.id}`} 
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                        >
                          <img 
                            src={tmdbApi.getPosterUrl(item.poster_path)} 
                            alt={item.name} 
                            className="w-10 h-14 object-cover rounded-md shadow-sm" 
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{tmdbApi.formatDate(item.date)}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 shrink-0" 
                            onClick={() => handleRemoveFromNotificationList(item.id, item.type)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <Bell className="w-10 h-10 text-muted-foreground/50 mb-2" />
                          <p className="text-sm text-muted-foreground">
                            No releases being tracked yet
                          </p>
                        </div>
                      )}
                      
                      {/* Coming Soon - Games */}
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-dashed border-border/50 opacity-60">
                        <div className="w-10 h-14 rounded-md bg-muted/50 flex items-center justify-center">
                          <Gamepad2 className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Games</p>
                          <p className="text-xs text-muted-foreground">Coming soon</p>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <Button 
                  variant="destructive" 
                  onClick={handleLogout}
                  className="sm:w-auto"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
                <Button 
                  onClick={handleSave} 
                  className="bg-gradient-to-r from-primary to-[hsl(var(--neon-pink))] hover:opacity-90 transition-opacity sm:w-auto"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
