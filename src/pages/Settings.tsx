import React, { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, User, Save, Info, LogOut, Trash2, Gamepad2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Country } from 'country-state-city';
import { showWelcomeNotification } from '@/lib/utils';
import { tmdbApi } from '@/services/tmdb';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PreferenceEditor } from '@/components/PreferenceEditor';

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
  
  const handleLogout = () => {
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
    return null; // or a loading spinner
  }

  const countryName = Country.getCountryByCode(formData.location.country)?.name || formData.location.country;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/')} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-neon-pink bg-clip-text text-transparent">
            Settings
          </h1>
        </header>

        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
          <div className="space-y-8">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><User /> Profile Information</CardTitle>
                <CardDescription>Update your personal details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData(p => p ? {...p, name: e.target.value} : null)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData(p => p ? {...p, email: e.target.value} : null)} />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input value={countryName} disabled />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Age</Label>
                    <Input value={formData.age} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Input value={formData.gender} className="capitalize" disabled />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Content Preferences</Label>
                    <PreferenceEditor 
                      user={formData} 
                      onUpdate={(updatedUser) => setFormData(updatedUser)} 
                    />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">Movies:</p>
                      <div className="flex flex-wrap gap-1">
                        {formData.interests.movies.map(genre => (
                          <Badge key={genre} variant="secondary" className="text-xs">{genre}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">TV Series:</p>
                      <div className="flex flex-wrap gap-1">
                        {formData.interests.series.map(genre => (
                          <Badge key={genre} variant="secondary" className="text-xs">{genre}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Filters:</p>
                      <div className="flex flex-wrap gap-1">
                        {[...formData.languages, ...formData.industries].map(pref => (
                          <Badge key={pref} variant="outline" className="text-xs">{pref}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bell /> Notifications</CardTitle>
                <CardDescription>Manage how you receive alerts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifications-switch" className="font-semibold">Enable Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive browser notifications for new releases.</p>
                    </div>
                    <Switch
                      id="notifications-switch"
                      checked={formData.notifications_enabled && notificationPermission === 'granted'}
                      onCheckedChange={handleNotificationToggle}
                      disabled={notificationPermission === 'denied'}
                    />
                  </div>
                  {notificationPermission === 'denied' && (
                    <div className="flex items-start gap-3 mt-4 p-3 text-sm rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                      <Info className="w-5 h-5 mt-0.5 shrink-0" />
                      <p>
                        You have blocked notifications. To receive alerts, you must manually enable them for this site in your browser's settings.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell /> Saved for Notifications</CardTitle>
              <CardDescription>Content you are tracking for release alerts.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[450px] pr-4">
                <div className="space-y-4">
                  {formData.notification_list.length > 0 ? formData.notification_list.map(item => (
                    <div key={`${item.type}-${item.id}`} className="flex items-center gap-4 p-2 rounded-lg bg-muted/50">
                      <img src={tmdbApi.getPosterUrl(item.poster_path)} alt={item.name} className="w-12 h-16 object-cover rounded-md" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{tmdbApi.formatDate(item.date)}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => handleRemoveFromNotificationList(item.id, item.type)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground text-center py-8">You are not tracking any specific releases yet.</p>
                  )}
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 opacity-50 cursor-not-allowed">
                    <div className="w-12 h-16 bg-muted rounded-md flex items-center justify-center">
                      <Gamepad2 className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Games</p>
                      <p className="text-xs text-muted-foreground">Feature coming soon</p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-between items-center">
            <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
            </Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-primary to-neon-pink">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
            </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
