import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Hash, Calendar, Shield } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  // Debug: log user object
  console.log('Profile - User object:', user);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-heading font-bold mb-8">Profile</h1>

        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{user?.name || 'User'}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="capitalize">
                    {user?.role || 'Voter'}
                  </Badge>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <Input value={user?.email || ''} disabled />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Student Registration Number (SRN)
                </Label>
                <Input value={user?.srn || ''} disabled className="font-mono" />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Role
                </Label>
                <Input value={user?.role || ''} disabled className="capitalize" />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Member Since
                </Label>
                <Input 
                  value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''} 
                  disabled 
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <Button variant="outline" disabled>
                Edit Profile (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
