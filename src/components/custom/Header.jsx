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
} from "@/components/ui/dialog"
import { FcGoogle } from "react-icons/fc";
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '@/service/firebaseConfig';
import { toast } from 'sonner';

function Header() {
    const [user, setUser] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleGoogleSignIn = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                const userProfile = {
                    name: result.user.displayName,
                    email: result.user.email,
                    photoURL: result.user.photoURL,
                    uid: result.user.uid,
                };
                localStorage.setItem('user', JSON.stringify(userProfile));
                setUser(userProfile);
                setOpenDialog(false);
                toast("Signed in successfully!");
            }).catch((error) => {
                console.error("Google Sign-In Error:", error);
                toast("Failed to sign in with Google. Please try again.");
            });
    };

    const handleLogout = () => {
        signOut(auth).then(() => {
            localStorage.removeItem('user');
            setUser(null);
            toast("You have been logged out.");
            navigate('/');
        }).catch((error) => {
            console.error("Logout Error:", error);
            toast("Failed to log out. Please try again.");
        });
    };

    return (
        <div className='p-3 shadow-sm flex justify-between items-center px-5'>
            <Link to='/'>
                <img src='/logo.svg' className='w-40 h-12 cursor-pointer' alt="Logo" />
            </Link>
            <div>
                {user ? (
                    <div className='flex items-center gap-3'>
                        <Link to={'/my-trips'}>
                            <Button variant="outline" className="rounded-full">My Trips</Button>
                        </Link>
                        <Popover>
                            <PopoverTrigger asChild>
                                <img 
                                    src={user.photoURL} 
                                    className='h-[35px] w-[35px] rounded-full cursor-pointer' 
                                    alt="User profile"
                                />
                            </PopoverTrigger>
                            <PopoverContent className="w-44">
                                <h2 
                                    onClick={handleLogout} 
                                    className="cursor-pointer p-2 hover:bg-gray-100 rounded-md"
                                >
                                    Logout
                                </h2>
                            </PopoverContent>
                        </Popover>
                    </div>
                ) : (
                    <Button className="h-10" onClick={() => setOpenDialog(true)}>
                        Sign In
                    </Button>
                )}
            </div>

            {/* Sign In Dialog */}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogDescription className="text-center">
                            <img src="/logo.svg" className='w-40 mx-auto' alt="Logo"/>
                            <h2 className='font-bold text-lg mt-7'>Sign In with Google</h2>
                            <p>Sign In to the Website with Google Authentication Securely.</p>
                            <Button 
                                onClick={handleGoogleSignIn}
                                className="w-full mt-5 flex gap-4 items-center"
                            >
                                <FcGoogle className='h-7 w-7' />
                                Sign In with Google
                            </Button>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default Header;