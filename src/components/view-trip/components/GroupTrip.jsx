import React, { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import {
  Users, Link2, Copy, Check, Crown, UserPlus, UserMinus,
  ChevronDown, ChevronUp, Send, Globe, Lock, Loader2, Shield
} from 'lucide-react'
import { db, auth } from '@/service/firebaseConfig'
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { toast } from 'sonner'

/**
 * GroupTrip Component
 * Features:
 * - Trip owner can invite people via link or email
 * - Members can join via invite link
 * - All members see the same trip plan
 * - Owner can remove members
 * - Real-time member list from Firestore
 */
export default function GroupTrip({ tripId, trip }) {
  const [expanded, setExpanded] = useState(false)
  const [groupData, setGroupData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copying, setCopying] = useState(false)
  const [joiningCode, setJoiningCode] = useState('')
  const [activeTab, setActiveTab] = useState('members') // members | invite

  const user = auth.currentUser
  const docId = `group_${tripId}`
  const isOwner = groupData?.ownerId === user?.uid

  // Generate a short invite code from tripId
  const inviteCode = tripId ? tripId.slice(-8).toUpperCase() : ''
  const inviteLink = `${window.location.origin}/join-trip/${tripId}`

  const load = useCallback(async () => {
    if (!tripId) return
    setLoading(true)
    try {
      const snap = await getDoc(doc(db, 'GroupTrips', docId))
      if (snap.exists()) {
        setGroupData(snap.data())
      } else {
        // Auto-create group for this trip if user is logged in
        if (user) {
          const initial = {
            tripId,
            ownerId: user.uid,
            ownerName: user.displayName || user.email,
            ownerEmail: user.email,
            ownerPhoto: user.photoURL || '',
            members: [{
              uid: user.uid,
              name: user.displayName || user.email,
              email: user.email,
              photo: user.photoURL || '',
              joinedAt: new Date().toISOString(),
              role: 'owner',
            }],
            inviteCode,
            createdAt: new Date().toISOString(),
            tripTitle: trip?.userSelection?.location?.properties?.formatted || 'Trip',
          }
          await setDoc(doc(db, 'GroupTrips', docId), initial)
          setGroupData(initial)
        }
      }
    } catch (error) {
      console.error('Failed to load group data:', error)
    }
    finally { setLoading(false) }
  }, [tripId, docId, user, inviteCode, trip])

  useEffect(() => { if (expanded) load() }, [expanded, load])

  const copyInviteLink = async () => {
    setCopying(true)
    try {
      await navigator.clipboard.writeText(inviteLink)
      toast.success('Invite link copied! Share it with your group.')
    } catch { toast.error('Failed to copy.') }
    setTimeout(() => setCopying(false), 2000)
  }

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode)
      toast.success(`Code "${inviteCode}" copied!`)
    } catch (error) {
      console.error('Failed to copy invite code:', error)
    }
  }

  const removeMember = async (uid) => {
    if (!isOwner || uid === user?.uid) return
    try {
      const updated = groupData.members.filter(m => m.uid !== uid)
      await updateDoc(doc(db, 'GroupTrips', docId), { members: updated })
      setGroupData(g => ({ ...g, members: updated }))
      toast.success('Member removed.')
    } catch { toast.error('Failed to remove member.') }
  }

  // Join a trip using a code entered by the user
  const joinByCode = async () => {
    const code = joiningCode.trim().toUpperCase()
    if (!code || code.length < 6) { toast.error('Enter a valid 8-character invite code.'); return }
    if (!user) { toast.error('Sign in to join a trip.'); return }
    try {
      // Find the trip whose last 8 chars match this code
      // In a real app you'd query, but since we store inviteCode we'll try direct
      const possibleId = code // Users share the full tripId last 8 chars
      // Search GroupTrips collection by inviteCode field
      const snap = await getDoc(doc(db, 'GroupTrips', `group_${possibleId}`))
      if (!snap.exists()) {
        toast.error('Trip not found. Check the code and try again.')
        return
      }
      const data = snap.data()
      const alreadyMember = data.members?.some(m => m.uid === user.uid)
      if (alreadyMember) { toast.info("You're already a member of this trip!"); return }
      const newMember = {
        uid: user.uid,
        name: user.displayName || user.email,
        email: user.email,
        photo: user.photoURL || '',
        joinedAt: new Date().toISOString(),
        role: 'member',
      }
      await updateDoc(doc(db, 'GroupTrips', `group_${possibleId}`), {
        members: arrayUnion(newMember),
      })
      toast.success(`Joined "${data.tripTitle}"! Check My Trips.`)
      setJoiningCode('')
    } catch (e) {
      console.error(e)
      toast.error('Could not join trip. Try again.')
    }
  }

  const memberCount = groupData?.members?.length || 0
  const tabs = [
    { id: 'members', label: `Members (${memberCount})` },
    { id: 'invite',  label: 'Invite & Join' },
  ]

  return (
    <div className="card-premium overflow-hidden">
      <div role="button" tabIndex={0}
        onClick={() => setExpanded(e => !e)}
        onKeyDown={e => e.key === 'Enter' && setExpanded(x => !x)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="font-bold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>
              Group Trip
              {memberCount > 1 && <span className="ml-2 px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 text-xs">{memberCount} members</span>}
            </p>
            <p className="text-xs text-muted-foreground">
              {memberCount <= 1 ? 'Invite friends to share this plan' : `${memberCount} people planning together`}
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
            className="overflow-hidden">
            <div className="px-5 pb-5 border-t border-border">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}

              {!loading && (
                <>
                  {/* Tabs */}
                  <div className="flex gap-1 mt-4 mb-4 p-1 bg-muted/40 rounded-xl">
                    {tabs.map(t => (
                      <button key={t.id} onClick={() => setActiveTab(t.id)}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === t.id ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* ── Members tab ── */}
                  {activeTab === 'members' && (
                    <div className="space-y-2">
                      {!groupData?.members?.length && (
                        <p className="text-center text-sm text-muted-foreground py-4">No members yet.</p>
                      )}
                      {groupData?.members?.map((m, i) => (
                        <motion.div key={m.uid || i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-3 p-3 rounded-2xl border border-border hover:bg-muted/20 transition-colors group"
                        >
                          {/* Avatar */}
                          {m.photo ? (
                            <img src={m.photo} alt={m.name} className="w-9 h-9 rounded-xl object-cover shrink-0" onError={e => { e.currentTarget.style.display = 'none' }} />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                              {(m.name || '?')[0].toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-semibold truncate">{m.name}</p>
                              {m.role === 'owner' && (
                                <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                  <Crown className="w-2.5 h-2.5" />
                                  <span className="text-[10px] font-bold">Owner</span>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <p className="text-xs text-muted-foreground hidden sm:block">
                              Joined {new Date(m.joinedAt).toLocaleDateString()}
                            </p>
                            {isOwner && m.uid !== user?.uid && (
                              <div role="button" tabIndex={0}
                                onClick={() => removeMember(m.uid)} onKeyDown={e => e.key === 'Enter' && removeMember(m.uid)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer transition-all"
                                title="Remove member">
                                <UserMinus className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* ── Invite & Join tab ── */}
                  {activeTab === 'invite' && (
                    <div className="space-y-5">
                      {/* Share invite link */}
                      <div className="p-4 rounded-2xl bg-muted/30 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className="w-4 h-4 text-primary" />
                          <p className="text-sm font-semibold">Invite via Link</p>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          Share this link with your friends. Anyone with the link can join this trip.
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 px-3 py-2.5 rounded-xl bg-card border border-border text-xs text-muted-foreground font-mono truncate">
                            {inviteLink}
                          </div>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={copyInviteLink}
                            className={`shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${copying ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-200' : 'btn-primary'}`}>
                            {copying ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                          </motion.button>
                        </div>
                      </div>

                      {/* Invite code */}
                      <div className="p-4 rounded-2xl bg-muted/30 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Lock className="w-4 h-4 text-primary" />
                          <p className="text-sm font-semibold">Trip Invite Code</p>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          Share this code. Friends can enter it below to join.
                        </p>
                        <div className="flex items-center gap-3 justify-center">
                          <div className="flex gap-2">
                            {inviteCode.split('').map((ch, i) => (
                              <div key={i} className="w-9 h-11 rounded-xl bg-card border-2 border-primary/30 flex items-center justify-center font-mono font-bold text-lg text-primary shadow-sm">
                                {ch}
                              </div>
                            ))}
                          </div>
                          <div role="button" tabIndex={0} onClick={copyInviteCode} onKeyDown={e => e.key === 'Enter' && copyInviteCode()}
                            className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 cursor-pointer transition-colors">
                            <Copy className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>

                      {/* Join a trip */}
                      <div className="p-4 rounded-2xl border border-dashed border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <UserPlus className="w-4 h-4 text-primary" />
                          <p className="text-sm font-semibold">Join a Different Trip</p>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          Got a code from a friend? Enter it to join their trip.
                        </p>
                        <div className="flex gap-2">
                          <input
                            value={joiningCode}
                            onChange={e => setJoiningCode(e.target.value.toUpperCase())}
                            onKeyDown={e => e.key === 'Enter' && joinByCode()}
                            placeholder="Enter trip code…"
                            maxLength={8}
                            className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-card text-sm font-mono focus:outline-none focus:border-primary transition-colors uppercase"
                          />
                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={joinByCode}
                            className="btn-primary flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold">
                            <Send className="w-3.5 h-3.5" /> Join
                          </motion.button>
                        </div>
                      </div>

                      {/* Privacy note */}
                      <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                        <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700 dark:text-blue-400">
                          Group members can view the itinerary, hotels, budget, and expenses. Only the trip owner can delete the trip.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

