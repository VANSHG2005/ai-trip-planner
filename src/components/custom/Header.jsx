import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Link, useNavigate } from 'react-router-dom'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { FcGoogle } from "react-icons/fc";
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '@/service/firebaseConfig';
import { toast } from 'sonner';
// Import icons from lucide-react
import { LogOut, MapPinned, UserPlus } from 'lucide-react';

function Header() {
    const [user, setUser] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Listen for auth state changes to keep user state in sync
        const unsubscribe = auth.onAuthStateChanged(userAuth => {
            if (userAuth) {
                const userProfile = {
                    name: userAuth.displayName,
                    email: userAuth.email,
                    photoURL: userAuth.photoURL,
                    uid: userAuth.uid,
                };
                localStorage.setItem('user', JSON.stringify(userProfile));
                setUser(userProfile);
            } else {
                localStorage.removeItem('user');
                setUser(null);
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const handleGoogleSignIn = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                setOpenDialog(false);
                toast.success("Signed in successfully!");
            }).catch((error) => {
                console.error("Google Sign-In Error:", error);
                toast.error("Failed to sign in. Please try again.");
            });
    };

    const handleLogout = () => {
        signOut(auth).then(() => {
            toast.success("You have been logged out.");
            navigate('/');
        }).catch((error) => {
            console.error("Logout Error:", error);
            toast.error("Failed to log out. Please try again.");
        });
    };

    return (
        <header className='sticky top-0 z-50'>
            <div className='flex justify-between items-center p-3 px-4 md:px-6 border-b bg-white/80 backdrop-blur-sm'>
                <Link to='/'>
                    <img src='/logo.svg' className='w-36 h-auto cursor-pointer transition-opacity hover:opacity-80' alt="Logo" />
                </Link>
                
                <div className='flex items-center gap-2'>
                    {user ? (
                        <>
                            <Link to={'/my-trips'}>
                                <Button variant="ghost" className="hidden sm:flex items-center gap-2 rounded-full">
                                    <MapPinned className='h-5 w-5' /> My Trips
                                </Button>
                            </Link>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <img 
                                        src={user.photoURL} 
                                        className='h-9 w-9 rounded-full cursor-pointer transition-transform hover:scale-110' 
                                        alt="User profile"
                                    />
                                </PopoverTrigger>
                                <PopoverContent className="w-56 mt-2 mr-2" align="end">
                                    <div className='p-2'>
                                        <p className="font-semibold truncate">{user.name}</p>
                                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                    </div>
                                    <div className='border-t my-2'></div>
                                    <Link to='/my-trips'>
                                        <div className='flex sm:hidden items-center gap-2 p-2 hover:bg-gray-100 rounded-md cursor-pointer'>
                                            <MapPinned className='h-4 w-4' /> My Trips
                                        </div>
                                    </Link>
                                    <div 
                                        onClick={handleLogout} 
                                        className="flex items-center gap-2 p-2 text-red-500 hover:bg-red-50 rounded-md cursor-pointer"
                                    >
                                        <LogOut className='h-4 w-4' /> Logout
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </>
                    ) : (
                        <Button 
                            onClick={() => setOpenDialog(true)}
                            className="flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all hover:shadow-md"
                        >
                            <UserPlus className='h-5 w-5' /> Sign In
                        </Button>
                    )}
                </div>
            </div>

            {/* Sign In Dialog */}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="text-center">
                        <DialogTitle className="text-2xl font-bold tracking-tight">
                            Welcome to Trip Planner
                        </DialogTitle>
                        <DialogDescription className="mt-2 text-gray-500">
                            Sign in with your Google account to save and manage your trips.
                        </DialogDescription>
                    </DialogHeader>
                    <div className='py-4'>
                        <Button 
                            onClick={handleGoogleSignIn}
                            className="w-full h-12 flex gap-3 items-center text-lg transition-transform hover:scale-105"
                            variant="outline"
                        >
                            <FcGoogle className='h-6 w-6' />
                            Sign In with Google
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </header>
    )
}

export default Header;