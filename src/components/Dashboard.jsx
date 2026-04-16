const Dashboard = ({ user }) => {
  return (
    <div className="text-center">
      <h2 className="text-5xl font-serif tracking-tighter mb-4">
        Good evening, {user.email.split('@')[0]}
      </h2>
      <p className="text-white/80 text-xl mb-12">Here's how your month is looking</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-8">
         
          <div className="text-5xl font-semibold">12</div>
          <p className="text-white/70 mt-2">Day streak</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-8">
          
          <div className="text-5xl font-semibold">78%</div>
          <p className="text-white/70 mt-2">Average mood</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-8">
          
          <div className="text-5xl font-semibold">8</div>
          <p className="text-white/70 mt-2">Journal entries</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;