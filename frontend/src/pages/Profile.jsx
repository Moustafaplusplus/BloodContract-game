/* ---------- imports ---------- */
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProfile, updateBio, uploadAvatar } from '../api/profileApi';
import { addFriend } from '../api/friendApi';
import { attack } from '../api/fightApi';
import { sendMessage } from '../api/messageApi';

/* ---------- tiny themed Button ---------- */
function Button({ children, variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    primary:
      'bg-gradient-to-r from-emerald-500 to-lime-500 text-gray-900 hover:opacity-90 focus:ring-emerald-400',
    danger:
      'bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:opacity-90 focus:ring-rose-400',
    ghost:
      'bg-transparent border border-gray-600 text-gray-200 hover:bg-gray-700/30 focus:ring-gray-500',
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default function Profile() {
  const { id } = useParams();          // undefined ⇒ my profile
  const nav = useNavigate();

  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState('');
  const [me, setMe] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ---- load profile ---- */
  useEffect(() => {
    getProfile(id).then(({ data }) => {
      setProfile(data);
      setBio(data.bio);
      setMe(!id || Number(id) === data.id);
      setLoading(false);
    });
  }, [id]);

  /* ---- handlers ---- */
  const handleSaveBio = () =>
    updateBio(bio).then(({ data }) => setProfile(data));

  const handleAvatar = (e) =>
    uploadAvatar(e.target.files[0]).then(({ data }) => setProfile(data));

  const handleAttack = () =>
    attack(profile.id).then(({ data }) =>
      alert(
        `الفائز: ${data.winner}\nالجولات: ${data.rounds}\n`
          + `الضرر الكلي: ${data.totalDamage}\n\n${data.log.join('\n')}`,
      ),
    );

  const handleMessage = () =>
    sendMessage(profile.id, 'مرحبا').finally(() =>
      nav(`/messenger/${profile.id}`),
    );

  /* ---- render ---- */
  if (loading) return <p className="p-6 text-gray-300">…Loading</p>;
  if (!profile) return <p className="p-6 text-gray-300">لا يوجد حساب</p>;

  return (
    <div className="flex min-h-screen flex-col bg-gray-900 px-4 pb-10 text-gray-200">
      {/* Header */}
      <header className="mx-auto w-full max-w-md py-6">
        <h1 className="text-center text-3xl font-extrabold tracking-wide text-emerald-400 drop-shadow-sm">
          الملف الشخصى
        </h1>
      </header>

      {/* Card */}
      <main className="mx-auto w-full max-w-md rounded-2xl bg-gray-800/80 p-6 shadow-lg ring-1 ring-gray-700 backdrop-blur">
        {/* Avatar & stats */}
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="relative">
            <img
              src={profile.avatarUrl}
              alt="avatar"
              className="h-28 w-28 rounded-full border-4 border-gray-700 object-cover shadow-inner"
            />
            {me && (
              <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-gray-700/80 p-1 text-xs hover:bg-gray-600">
                📷
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatar}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Stats */}
          <div className="space-y-1 text-sm sm:text-base">
            <p className="font-semibold text-emerald-300">{profile.username}</p>
            <p>💰 <span className="font-mono">{profile.money}</span></p>
            <p>🏆 LV {profile.level}</p>
            <p>❤️ {profile.hp}</p>
          </div>
        </div>

        {/* Bio */}
        <section className="mt-6">
          <h2 className="mb-1 font-semibold text-gray-300">الوصف</h2>
          {me ? (
            <>
              <textarea
                className="h-24 w-full resize-none rounded-md border border-gray-600 bg-gray-700 p-2 text-sm text-gray-100 placeholder-gray-400 focus:border-emerald-400 focus:ring-emerald-400"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="اكتب وصفًا قصيرًا عن نفسك…"
              />
              <Button variant="ghost" className="mt-2" onClick={handleSaveBio}>
                حفظ
              </Button>
            </>
          ) : (
            <p className="rounded-md bg-gray-700/60 p-3 text-sm leading-relaxed">
              {profile.bio || 'لا يوجد وصف بعد…'}
            </p>
          )}
        </section>

        {/* Actions */}
        {!me && (
          <section className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button variant="primary" className="flex-1" onClick={() => addFriend(profile.id)}>
              أضف حليفًا
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleAttack}>
              هاجم
            </Button>
            <Button variant="ghost" className="flex-1" onClick={handleMessage}>
              رسالة
            </Button>
          </section>
        )}
      </main>
    </div>
  );
}
