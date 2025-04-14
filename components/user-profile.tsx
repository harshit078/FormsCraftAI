import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserProfile() {
  const { user, loading, error, signInWithGoogle, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive text-sm">{error}</div>;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (!user) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={signInWithGoogle}
        className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 text-white
               border border-indigo-500/20 rounded-xl p-4 flex items-center 
               justify-center gap-3 transition-all duration-200"
      >
        <img src="/google.png" className="h-5 w-5" alt="Google logo" />
        <span>Continue with Google</span>
      </motion.button>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="flex mt-3" variant="outline">Account</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Account</DropdownMenuLabel>
          <DropdownMenuItem className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage
                src={user.photoURL || undefined}
                alt={user.displayName || "User"}
              />
              <AvatarFallback>{user.displayName?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{user.displayName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuItem>
          <DropdownMenuGroup></DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-destructive focus:text-destructive"
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
