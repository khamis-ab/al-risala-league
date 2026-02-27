import { useState, useEffect, useCallback, useRef } from 'react'
import { storageGet, storageSet, storageSubscribe } from './firebase.js'

// ─── DATA ─────────────────────────────────────────────────────────────────────
const INITIAL_TEAMS = [
  { id:1, name:"ISS Egypt",        nameAr:"ISS Egypt",       color:"#e4c55a" },
  { id:2, name:"Al-Malaki",        nameAr:"المالكي",          color:"#5aade4" },
  { id:3, name:"Liverpool",        nameAr:"ليفرفول",          color:"#e45a5a" },
  { id:4, name:"Subia",            nameAr:"سوبيا",            color:"#5ae47a" },
  { id:5, name:"Ocean Stars",      nameAr:"Ocean Stars",      color:"#5ae4d4" },
  { id:6, name:"Ultras",           nameAr:"Ultras",           color:"#e4875a" },
  { id:7, name:"Atletico Skudai",  nameAr:"Atletico Skudai",  color:"#c55ae4" },
  { id:8, name:"Al-Jedyan Sokoor", nameAr:"الجديان صقور",     color:"#e45aab" },
]

const INITIAL_PLAYERS = {
  1:[
    {id:"1-1",name:"Khamis",            captain:true },
    {id:"1-2",name:"Ali Khaled",        captain:false},
    {id:"1-3",name:"Ahmed Abdelrahman", captain:false},
    {id:"1-4",name:"Mahmoud",           captain:false},
    {id:"1-5",name:"Waleed",            captain:false},
    {id:"1-6",name:"Muhy",              captain:false},
  ],
  2:[
    {id:"2-1",name:"Omar Abdullah",        captain:true },
    {id:"2-2",name:"Aiman Alhdian",        captain:false},
    {id:"2-3",name:"Abdullah Saleh Hanan", captain:false},
    {id:"2-4",name:"Ali Ahmed Almustafa",  captain:false},
    {id:"2-5",name:"Muaaz Ahmed Eltahir",  captain:false},
    {id:"2-6",name:"Mahdi Yousif",         captain:false},
    {id:"2-7",name:"Asaad Seifeldin",      captain:false},
  ],
  3:[
    {id:"3-1",name:"Ahmed Khalid Mohamed",     captain:true, nonPlaying:true},
    {id:"3-2",name:"Mohammed Elfadil Zakaria", captain:false},
    {id:"3-3",name:"Ali Mohamed Ali Abdalla",  captain:false},
    {id:"3-4",name:"Mohsen Emad Meabah",       captain:false},
    {id:"3-5",name:"Jad Kachlan",              captain:false},
    {id:"3-6",name:"Mohamed Hishameldeen",     captain:false},
    {id:"3-7",name:"Awab Mujtaba Hamed",       captain:false},
    {id:"3-8",name:"Rashad Mustafa Gaffer",    captain:false},
    {id:"3-9",name:"Basil Mudathir Ali",       captain:false},
  ],
  4:[
    {id:"4-1",name:"Ziad",         captain:true },
    {id:"4-2",name:"Marwan",       captain:false},
    {id:"4-3",name:"Obai",         captain:false},
    {id:"4-4",name:"Loay Ahmed",   captain:false},
    {id:"4-5",name:"Ahmed Refaat", captain:false},
    {id:"4-6",name:"Girges Ayman", captain:false},
    {id:"4-7",name:"Ibrahim",      captain:false},
  ],
  5:[
    {id:"5-1",name:"Mohamed Hussein",          captain:true },
    {id:"5-2",name:"Abdirahman Wardhere",      captain:false},
    {id:"5-3",name:"Osman Ibrahim Adan",       captain:false},
    {id:"5-4",name:"Yusuf Ahmed Hadi",         captain:false},
    {id:"5-5",name:"Khalid Ahmed Ali",         captain:false},
    {id:"5-6",name:"Abdirahim Mohamed Hassan", captain:false},
    {id:"5-7",name:"Abdibasid Sheikh Ahmed",   captain:false},
    {id:"5-8",name:"Abdiaziz Abdirahman",      captain:false},
  ],
  6:[
    {id:"6-1",name:"Abdulrahman Aljunaidi", captain:true },
    {id:"6-2",name:"Amr Yousef Alwafi",     captain:false},
    {id:"6-3",name:"Mohammed Ameen Ali",    captain:false},
    {id:"6-4",name:"Waleed Sami Alsumaini", captain:false},
    {id:"6-5",name:"Mohammed Abdullah",     captain:false},
    {id:"6-6",name:"Mousa Ali Al-Shami",    captain:false},
    {id:"6-7",name:"Mohammed Moqbel",       captain:false},
  ],
  7:[
    {id:"7-1",name:"Abdalla Mohamed Hanafy", captain:true },
    {id:"7-2",name:"Mohamed Dyab",           captain:false},
    {id:"7-3",name:"Mohamed Fairoz",         captain:false},
    {id:"7-4",name:"Abdulmalek Fairoz",      captain:false},
    {id:"7-5",name:"Ali Ehab",               captain:false},
    {id:"7-6",name:"Mohammed Zaakam",        captain:false},
  ],
  8:[
    {id:"8-1",name:"Natnael Sengal", captain:true },
    {id:"8-2",name:"Player 2",       captain:false},
    {id:"8-3",name:"Player 3",       captain:false},
    {id:"8-4",name:"Player 4",       captain:false},
    {id:"8-5",name:"Player 5",       captain:false},
    {id:"8-6",name:"Player 6",       captain:false},
    {id:"8-7",name:"Player 7",       captain:false},
  ],
}

const MATCHES = [
  {id:"M1", day:1,slot:1,time:"23:00–23:15",home:1,away:8},
  {id:"M2", day:1,slot:1,time:"23:00–23:15",home:2,away:7},
  {id:"M3", day:1,slot:2,time:"23:25–23:40",home:3,away:6},
  {id:"M4", day:1,slot:2,time:"23:25–23:40",home:4,away:5},
  {id:"M5", day:1,slot:3,time:"23:50–00:05",home:1,away:7},
  {id:"M6", day:1,slot:3,time:"23:50–00:05",home:8,away:6},
  {id:"M7", day:1,slot:4,time:"00:15–00:30",home:2,away:5},
  {id:"M8", day:1,slot:4,time:"00:15–00:30",home:3,away:4},
  {id:"M9", day:2,slot:1,time:"23:00–23:15",home:1,away:6},
  {id:"M10",day:2,slot:1,time:"23:00–23:15",home:7,away:5},
  {id:"M11",day:2,slot:2,time:"23:25–23:40",home:8,away:4},
  {id:"M12",day:2,slot:2,time:"23:25–23:40",home:2,away:3},
  {id:"M13",day:2,slot:3,time:"23:50–00:05",home:1,away:5},
  {id:"M14",day:2,slot:3,time:"23:50–00:05",home:6,away:4},
  {id:"M15",day:2,slot:4,time:"00:15–00:30",home:7,away:3},
  {id:"M16",day:2,slot:4,time:"00:15–00:30",home:8,away:2},
  {id:"M17",day:2,slot:5,time:"00:40–00:55",home:1,away:4},
  {id:"M18",day:2,slot:5,time:"00:40–00:55",home:5,away:3},
  {id:"M19",day:2,slot:6,time:"01:05–01:20",home:6,away:2},
  {id:"M20",day:2,slot:6,time:"01:05–01:20",home:7,away:8},
  {id:"M21",day:3,slot:1,time:"23:00–23:15",home:1,away:3},
  {id:"M22",day:3,slot:1,time:"23:00–23:15",home:4,away:2},
  {id:"M23",day:3,slot:2,time:"23:25–23:40",home:5,away:8},
  {id:"M24",day:3,slot:2,time:"23:25–23:40",home:6,away:7},
  {id:"M25",day:3,slot:3,time:"23:50–00:05",home:1,away:2},
  {id:"M26",day:3,slot:3,time:"23:50–00:05",home:3,away:8},
  {id:"M27",day:3,slot:4,time:"00:15–00:30",home:4,away:7},
  {id:"M28",day:3,slot:4,time:"00:15–00:30",home:5,away:6},
  {id:"SF1",day:4,slot:1,time:"23:00–23:35",isKnockout:true,label:"Semi-Final 1",desc:"1st vs 4th"},
  {id:"SF2",day:4,slot:2,time:"23:50–00:25",isKnockout:true,label:"Semi-Final 2",desc:"2nd vs 3rd"},
  {id:"F1", day:4,slot:3,time:"00:40–01:15",isKnockout:true,label:"🏆 Final",    desc:"Winner SF1 vs Winner SF2"},
]

const ADMIN_PIN = "khamis1"

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function computeStandings(teams, scores) {
  const stats = {}
  teams.forEach(t => { stats[t.id] = {...t, p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0} })
  MATCHES.filter(m=>!m.isKnockout).forEach(m => {
    const s = scores[m.id]
    if (!s || s.homeGoals==="" || s.homeGoals===undefined) return
    const hg=parseInt(s.homeGoals)||0, ag=parseInt(s.awayGoals)||0
    const ht=stats[m.home], at=stats[m.away]
    if (!ht||!at) return
    ht.p++; at.p++; ht.gf+=hg; ht.ga+=ag; at.gf+=ag; at.ga+=hg
    if(hg>ag){ht.w++;ht.pts+=3;at.l++}
    else if(ag>hg){at.w++;at.pts+=3;ht.l++}
    else{ht.d++;at.d++;ht.pts++;at.pts++}
  })
  return Object.values(stats).sort((a,b)=>{
    if(b.pts!==a.pts) return b.pts-a.pts
    if((b.gf-b.ga)!==(a.gf-a.ga)) return (b.gf-b.ga)-(a.gf-a.ga)
    return b.gf-a.gf
  })
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Bebas+Neue&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#080f1a;-webkit-tap-highlight-color:transparent}
  ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:#080f1a}::-webkit-scrollbar-thumb{background:#1e3a52;border-radius:4px}
  .fade{animation:fi .3s ease both}
  @keyframes fi{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  .hrow:hover{background:rgba(90,173,228,.08)!important;cursor:pointer}
  .btn{cursor:pointer;border:none;font-family:inherit;font-weight:600;border-radius:8px;transition:all .18s}
  .btn:hover{filter:brightness(1.12);transform:translateY(-1px)}
  .btn:active{transform:translateY(0)}
  .nb{background:none;border:none;cursor:pointer;font-family:inherit;transition:all .2s}
  input{font-family:inherit}input:focus{outline:none}
  .pill{display:inline-flex;align-items:center;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700;letter-spacing:.5px}
  .sc-in{width:54px;height:48px;background:#080f1a;border:2px solid #1e3a52;border-radius:10px;color:#fff;font-size:24px;font-weight:800;text-align:center;font-family:inherit}
  .sc-in:focus{border-color:#5aade4}
  .pchip{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 12px;border-radius:8px;background:#080f1a;border:1.5px solid #1e3a52;cursor:pointer;transition:all .15s;font-size:13px;font-weight:500;color:rgba(255,255,255,.7);width:100%;text-align:left}
  .pchip:hover{border-color:#5aade4;color:#fff}
  .pchip.sel{border-color:#5aade4;background:rgba(90,173,228,.12);color:#5aade4}
  .live-dot{width:7px;height:7px;border-radius:50%;background:#e45a5a;display:inline-block;animation:pulse 1.2s ease-in-out infinite;flex-shrink:0}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}
  .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  @media(max-width:650px){.grid-2{grid-template-columns:1fr}}
  .tab-input{background:#080f1a;border:1.5px solid #1e3a52;border-radius:8px;padding:9px 12px;color:#fff;font-size:13px;transition:border-color .15s}
  .tab-input:focus{border-color:#5aade4}
  .sync-dot{width:6px;height:6px;border-radius:50%;display:inline-block;flex-shrink:0}
`

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [view,          setView]          = useState("standings")
  const [teams,         setTeams]         = useState(INITIAL_TEAMS)
  const [players,       setPlayers]       = useState(INITIAL_PLAYERS)
  const [scores,        setScores]        = useState({})
  const [selTeam,       setSelTeam]       = useState(null)
  const [selMatch,      setSelMatch]      = useState(null)
  const [isAdmin,       setIsAdmin]       = useState(false)
  const [pin,           setPin]           = useState("")
  const [pinErr,        setPinErr]        = useState(false)
  const [activeDay,     setActiveDay]     = useState(1)
  const [loaded,        setLoaded]        = useState(false)
  const [saveSt,        setSaveSt]        = useState("")
  const [syncStatus,    setSyncStatus]    = useState("connecting") // connecting | live | error
  const [newPlayerName, setNewPlayerName] = useState("")
  const [adminTab,      setAdminTab]      = useState("matches")

  // ── FIREBASE REAL-TIME LISTENERS ──────────────────────────────────────────
  useEffect(()=>{
    setSyncStatus("connecting")
    const unsubs = []

    // Subscribe to all 3 keys with real-time listeners
    unsubs.push(storageSubscribe("rl_players", val => {
      if(val) setPlayers(JSON.parse(val))
    }))

    unsubs.push(storageSubscribe("rl_scores", val => {
      setScores(val ? JSON.parse(val) : {})
      setSyncStatus("live")
      setLoaded(true)
    }))

    unsubs.push(storageSubscribe("rl_teams", val => {
      if(val) setTeams(JSON.parse(val))
    }))

    // Fallback: if no data exists yet, still mark as loaded after 3s
    const fallback = setTimeout(()=>{ setLoaded(true); setSyncStatus("live") }, 3000)

    return ()=>{ unsubs.forEach(u=>u()); clearTimeout(fallback) }
  },[])

  const persist = useCallback(async (key, val) => {
    try {
      await storageSet(key, JSON.stringify(val))
      setSaveSt("Saved ✓")
      setTimeout(()=>setSaveSt(""), 2000)
    } catch(e) {
      setSaveSt("Save failed!")
      setSyncStatus("error")
    }
  },[])

  // ── FIX 1: wipeAllData uses set() with defaults ───────────────────────────
  const wipeAllData = async () => {
    if(!window.confirm("⚠️ Delete ALL scores and added players? Cannot be undone.")) return
    await Promise.all([
      storageSet("rl_teams",   JSON.stringify(INITIAL_TEAMS)),
      storageSet("rl_players", JSON.stringify(INITIAL_PLAYERS)),
      storageSet("rl_scores",  JSON.stringify({})),
    ])
    setTeams(INITIAL_TEAMS)
    setPlayers(INITIAL_PLAYERS)
    setScores({})
    setSaveSt("Reset!")
    setTimeout(()=>setSaveSt(""), 3000)
  }

  const standings = computeStandings(teams, scores)

  const getKnockoutTeams = (matchId) => {
    if(matchId==="SF1") return {h:standings[0]?.id, a:standings[3]?.id}
    if(matchId==="SF2") return {h:standings[1]?.id, a:standings[2]?.id}
    if(matchId==="F1"){
      const winner=(id,hId,aId)=>{
        const s=scores[id]; if(!s||s.homeGoals==="") return null
        return parseInt(s.homeGoals)>parseInt(s.awayGoals)?hId:parseInt(s.awayGoals)>parseInt(s.homeGoals)?aId:null
      }
      return{h:winner("SF1",standings[0]?.id,standings[3]?.id),a:winner("SF2",standings[1]?.id,standings[2]?.id)}
    }
    return{h:null,a:null}
  }

  // ── LOADING SCREEN ────────────────────────────────────────────────────────
  if(!loaded) return(
    <div style={{background:"#080f1a",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
      <style>{CSS}</style>
      <div style={{fontSize:40}}>⚽</div>
      <div style={{color:"#5aade4",fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:3}}>AL-RISALA LEAGUE</div>
      <div style={{color:"rgba(255,255,255,.3)",fontSize:13}}>Connecting to live data…</div>
    </div>
  )

  // ── ADMIN LOGIN ───────────────────────────────────────────────────────────
  if(view==="admin"&&!isAdmin) return(
    <div style={{background:"#080f1a",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Outfit',sans-serif",padding:20}}>
      <style>{CSS}</style>
      <div className="fade" style={{width:"100%",maxWidth:360,background:"#0d1b2a",borderRadius:18,padding:40,border:"1px solid #1e3a52",textAlign:"center"}}>
        <div style={{fontSize:44,marginBottom:12}}>🔐</div>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:30,letterSpacing:1,marginBottom:6}}>Admin Access</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,.4)",marginBottom:24}}>Enter PIN to manage the tournament</div>
        <input type="password" value={pin} onChange={e=>{setPin(e.target.value);setPinErr(false)}}
          onKeyDown={e=>{if(e.key==="Enter"){if(pin===ADMIN_PIN){setIsAdmin(true);setView("standings");setPin("")}else setPinErr(true)}}}
          placeholder="• • • •" style={{width:"100%",background:"#080f1a",border:`2px solid ${pinErr?"#e45a5a":"#1e3a52"}`,borderRadius:10,padding:"14px",color:"#fff",fontSize:22,letterSpacing:8,textAlign:"center",marginBottom:12}}/>
        {pinErr&&<div style={{color:"#e45a5a",fontSize:13,marginBottom:12}}>Wrong PIN — try again</div>}
        <button className="btn" onClick={()=>{if(pin===ADMIN_PIN){setIsAdmin(true);setView("standings");setPin("")}else setPinErr(true)}}
          style={{width:"100%",background:"#5aade4",color:"#080f1a",padding:"14px",fontSize:15}}>Unlock</button>
        <button className="nb" onClick={()=>setView("standings")} style={{marginTop:14,fontSize:13,color:"rgba(255,255,255,.3)"}}>← Back</button>
      </div>
    </div>
  )

  // ── SCORE ENTRY ───────────────────────────────────────────────────────────
  const renderScoreEntry=()=>{
    const match=MATCHES.find(m=>m.id===selMatch)
    if(!match) return null
    const dyn=match.isKnockout?getKnockoutTeams(match.id):{h:match.home,a:match.away}
    const s=scores[match.id]||{homeGoals:"",awayGoals:"",scorers:[],live:false}
    const ht=teams.find(t=>t.id===dyn.h)
    const at=teams.find(t=>t.id===dyn.a)
    const hp=(players[dyn.h]||[]).filter(p=>!p.nonPlaying)
    const ap=(players[dyn.a]||[]).filter(p=>!p.nonPlaying)
    const scorers=s.scorers||[]

    const upd=(field,val)=>{
      const u={...scores,[match.id]:{...s,[field]:val}}
      setScores(u); persist("rl_scores",u)
    }

    const toggleScorer=(playerId,teamId)=>{
      const isHome=teamId===dyn.h
      const key=isHome?"homeGoals":"awayGoals"
      const cur=parseInt(s[key])||0
      const idx=scorers.findIndex(sc=>sc.playerId===playerId&&sc.teamId===teamId)
      let ns,newGoals
      if(idx>=0){ns=scorers.filter((_,i)=>i!==idx);newGoals=Math.max(0,cur-1)}
      else{ns=[...scorers,{playerId,teamId}];newGoals=cur+1}
      const u={...scores,[match.id]:{...s,scorers:ns,[key]:newGoals}}
      setScores(u); persist("rl_scores",u)
    }

    const goalsByPlayer={}
    scorers.forEach(sc=>{goalsByPlayer[sc.playerId]=(goalsByPlayer[sc.playerId]||0)+1})

    return(
      <div className="fade">
        <button className="nb" onClick={()=>setView("matches")} style={{color:"#5aade4",fontSize:13,fontWeight:600,marginBottom:20,display:"flex",alignItems:"center",gap:6}}>← Back to Matches</button>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:30,letterSpacing:1}}>Score Entry</div>
          <button className="btn" onClick={()=>upd("live",!s.live)}
            style={{background:s.live?"rgba(228,90,90,.2)":"rgba(255,255,255,.06)",color:s.live?"#e45a5a":"rgba(255,255,255,.4)",border:`1px solid ${s.live?"rgba(228,90,90,.4)":"rgba(255,255,255,.1)"}`,padding:"7px 14px",fontSize:12,display:"flex",alignItems:"center",gap:6}}>
            {s.live?<><span className="live-dot" style={{width:6,height:6}}/>&nbsp;LIVE ON</>:"⬤ Set as Live"}
          </button>
        </div>
        <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:24}}>{match.id} · Day {match.day} · {match.time}</div>
        <div style={{background:"#0d1b2a",borderRadius:16,padding:28,border:`1px solid ${s.live?"rgba(228,90,90,.4)":"#1e3a52"}`,marginBottom:16,textAlign:"center",boxShadow:s.live?"0 0 20px rgba(228,90,90,.12)":"none"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:24}}>
            <div style={{flex:1,textAlign:"right"}}>
              <div style={{fontSize:14,fontWeight:700,color:ht?.color,marginBottom:10}}>{ht?.name||"TBD"}</div>
              <input className="sc-in" type="number" min="0" value={s.homeGoals} onChange={e=>upd("homeGoals",e.target.value)} placeholder="0" disabled={!ht}/>
            </div>
            <div style={{fontSize:18,color:"rgba(255,255,255,.25)",fontWeight:700}}>–</div>
            <div style={{flex:1,textAlign:"left"}}>
              <div style={{fontSize:14,fontWeight:700,color:at?.color,marginBottom:10}}>{at?.name||"TBD"}</div>
              <input className="sc-in" type="number" min="0" value={s.awayGoals} onChange={e=>upd("awayGoals",e.target.value)} placeholder="0" disabled={!at}/>
            </div>
          </div>
        </div>
        {ht&&at&&(
          <div style={{background:"#0d1b2a",borderRadius:16,padding:24,border:"1px solid #1e3a52"}}>
            <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.4)",letterSpacing:1.5,textTransform:"uppercase",marginBottom:18}}>
              ⚽ Goal Scorers <span style={{fontWeight:400,color:"rgba(255,255,255,.2)"}}>— tap to add / remove</span>
            </div>
            <div className="grid-2">
              {[{team:ht,pl:hp},{team:at,pl:ap}].map(({team,pl})=>(
                <div key={team?.id}>
                  <div style={{fontSize:12,fontWeight:700,color:team?.color,marginBottom:10}}>{team?.name}</div>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {pl.map(p=>{
                      const goals=goalsByPlayer[p.id]||0
                      return(
                        <button key={p.id} className={`pchip ${goals>0?"sel":""}`} onClick={()=>toggleScorer(p.id,team?.id)}>
                          <span>{p.name}{p.captain?" ©":""}</span>
                          {goals>0&&<span style={{background:team?.color+"33",color:team?.color,borderRadius:99,padding:"1px 8px",fontSize:11,fontWeight:700,flexShrink:0}}>⚽ {goals}</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── TEAM DETAIL ───────────────────────────────────────────────────────────
  const renderTeamDetail=()=>{
    const team=teams.find(t=>t.id===selTeam)
    if(!team) return null
    const pl=players[team.id]||[]
    const stat=standings.find(s=>s.id===team.id)||{}
    const rank=standings.findIndex(s=>s.id===team.id)+1
    const goalCount={}
    Object.values(scores).forEach(s=>{(s.scorers||[]).forEach(sc=>{if(sc.teamId===team.id) goalCount[sc.playerId]=(goalCount[sc.playerId]||0)+1})})
    const teamMatches=MATCHES.filter(m=>!m.isKnockout&&(m.home===team.id||m.away===team.id))
    return(
      <div className="fade">
        <button className="nb" onClick={()=>setView("teams")} style={{color:"#5aade4",fontSize:13,fontWeight:600,marginBottom:20,display:"flex",alignItems:"center",gap:6}}>← All Teams</button>
        <div style={{background:`linear-gradient(135deg,${team.color}18,#0d1b2a)`,borderRadius:16,padding:28,border:`1px solid ${team.color}44`,marginBottom:18}}>
          <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:18}}>
            <div style={{width:52,height:52,borderRadius:"50%",background:team.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800,color:"#080f1a",flexShrink:0}}>{team.name[0]}</div>
            <div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:34,letterSpacing:1,lineHeight:1}}>{team.name}</div>
              {team.nameAr!==team.name&&<div style={{fontSize:15,color:"rgba(255,255,255,.45)",marginTop:2}}>{team.nameAr}</div>}
              <div style={{fontSize:12,color:"rgba(255,255,255,.3)",marginTop:4}}>Ranked #{rank} · {pl.length} players</div>
            </div>
          </div>
          <div style={{display:"flex",gap:0,background:"#080f1a",borderRadius:12,overflow:"hidden"}}>
            {[["P",stat.p||0,"rgba(255,255,255,.55)"],["W",stat.w||0,"#5ae47a"],["D",stat.d||0,"#e4c55a"],["L",stat.l||0,"#e45a5a"],["GF",stat.gf||0,"rgba(255,255,255,.55)"],["GD",(stat.gf||0)-(stat.ga||0),(stat.gf||0)-(stat.ga||0)>0?"#5ae47a":(stat.gf||0)-(stat.ga||0)<0?"#e45a5a":"rgba(255,255,255,.55)"],["PTS",stat.pts||0,team.color]].map(([l,v,c],i,arr)=>(
              <div key={l} style={{flex:1,padding:"12px 4px",textAlign:"center",borderRight:i<arr.length-1?"1px solid #1e3a52":"none"}}>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:24,color:c,lineHeight:1}}>{l==="GD"&&v>0?"+":""}{v}</div>
                <div style={{fontSize:9,color:"rgba(255,255,255,.3)",letterSpacing:1,marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid-2">
          <div style={{background:"#0d1b2a",borderRadius:12,padding:20,border:"1px solid #1e3a52"}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:"rgba(255,255,255,.35)",marginBottom:14}}>Squad</div>
            {pl.map(p=>{
              const goals=goalCount[p.id]||0
              return(
                <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:30,height:30,borderRadius:"50%",background:team.color+"25",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:team.color}}>{p.name[0]}</div>
                    <div>
                      <div style={{fontSize:14,fontWeight:500}}>{p.name}</div>
                      {p.captain&&!p.nonPlaying&&<div style={{fontSize:9,color:team.color,fontWeight:700,letterSpacing:.5}}>CAPTAIN</div>}
                      {p.nonPlaying&&<div style={{fontSize:9,color:"rgba(228,90,90,.8)",fontWeight:700,letterSpacing:.5}}>COACH</div>}
                    </div>
                  </div>
                  {goals>0&&<div style={{fontSize:13,color:"#e4c55a",fontWeight:700}}>⚽ {goals}</div>}
                </div>
              )
            })}
            {isAdmin&&(
              <div style={{marginTop:14,display:"flex",gap:8}}>
                <input className="tab-input" style={{flex:1}} value={newPlayerName} onChange={e=>setNewPlayerName(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"&&newPlayerName.trim()){const np={id:`${team.id}-${Date.now()}`,name:newPlayerName.trim(),captain:false};const u={...players,[team.id]:[...(players[team.id]||[]),np]};setPlayers(u);persist("rl_players",u);setNewPlayerName("")}}}
                  placeholder="New player name…"/>
                <button className="btn" onClick={()=>{if(newPlayerName.trim()){const np={id:`${team.id}-${Date.now()}`,name:newPlayerName.trim(),captain:false};const u={...players,[team.id]:[...(players[team.id]||[]),np]};setPlayers(u);persist("rl_players",u);setNewPlayerName("")}}}
                  style={{background:"#5aade4",color:"#080f1a",padding:"8px 16px",fontSize:13,flexShrink:0}}>Add</button>
              </div>
            )}
          </div>
          <div style={{background:"#0d1b2a",borderRadius:12,padding:20,border:"1px solid #1e3a52"}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:"rgba(255,255,255,.35)",marginBottom:14}}>Results</div>
            {teamMatches.map(m=>{
              const s=scores[m.id]; const isHome=m.home===team.id
              const opp=teams.find(t=>t.id===(isHome?m.away:m.home))
              const played=s&&s.homeGoals!==undefined&&s.homeGoals!==""
              const hg=played?parseInt(s.homeGoals)||0:null; const ag=played?parseInt(s.awayGoals)||0:null
              const my=isHome?hg:ag, op=isHome?ag:hg
              const res=played?(my>op?"W":my<op?"L":"D"):null
              return(
                <div key={m.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.3)",width:28,flexShrink:0}}>{m.id}</div>
                  <div style={{flex:1,fontSize:13,fontWeight:500}}>{opp?.name}</div>
                  {s?.live&&<span className="live-dot" style={{width:6,height:6}}/>}
                  {played?<div style={{display:"flex",alignItems:"center",gap:7}}><span style={{fontWeight:700,fontSize:14}}>{my}–{op}</span><span className="pill" style={{background:res==="W"?"rgba(90,228,122,.15)":res==="L"?"rgba(228,90,90,.15)":"rgba(228,197,90,.15)",color:res==="W"?"#5ae47a":res==="L"?"#e45a5a":"#e4c55a"}}>{res}</span></div>
                    :<span style={{fontSize:11,color:"rgba(255,255,255,.2)"}}>upcoming</span>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── STANDINGS ─────────────────────────────────────────────────────────────
  const renderStandings=()=>{
    const allGoals={}
    Object.entries(scores).forEach(([,s])=>{(s.scorers||[]).forEach(sc=>{if(!allGoals[sc.playerId]) allGoals[sc.playerId]={count:0,teamId:sc.teamId};allGoals[sc.playerId].count++})})
    const topScorers=Object.entries(allGoals).sort((a,b)=>b[1].count-a[1].count).slice(0,5)
    const liveMatches=MATCHES.filter(m=>scores[m.id]?.live)
    return(
      <div className="fade">
        {liveMatches.length>0&&(
          <div style={{background:"rgba(228,90,90,.08)",border:"1px solid rgba(228,90,90,.3)",borderRadius:12,padding:"12px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
            <span className="live-dot"/><span style={{fontSize:13,fontWeight:700,color:"#e45a5a"}}>LIVE NOW</span>
            {liveMatches.map(m=>{
              const dyn=m.isKnockout?getKnockoutTeams(m.id):{h:m.home,a:m.away}
              const ht=teams.find(t=>t.id===dyn.h); const at=teams.find(t=>t.id===dyn.a)
              const s=scores[m.id]||{}
              return(<span key={m.id} style={{fontSize:13,color:"rgba(255,255,255,.8)",background:"rgba(255,255,255,.06)",padding:"4px 12px",borderRadius:20}}>{ht?.name||"TBD"} <strong>{s.homeGoals||0}–{s.awayGoals||0}</strong> {at?.name||"TBD"}</span>)
            })}
          </div>
        )}
        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:36,letterSpacing:1,lineHeight:1}}>Standings</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.3)",marginTop:4,display:"flex",alignItems:"center",gap:6}}>
              <span className="sync-dot" style={{background:syncStatus==="live"?"#5ae47a":syncStatus==="error"?"#e45a5a":"#e4c55a"}}/>
              {syncStatus==="live"?"Live sync active":syncStatus==="error"?"Sync error — check connection":"Connecting…"}
            </div>
          </div>
        </div>
        <div style={{background:"#0d1b2a",borderRadius:14,border:"1px solid #1e3a52",marginBottom:20,overflowX:"auto"}}>
          <div style={{minWidth:500}}>
            <div style={{display:"grid",gridTemplateColumns:"32px 1fr 36px 36px 36px 36px 46px 46px 54px",padding:"10px 16px",background:"#080f1a",fontSize:10,fontWeight:700,color:"rgba(255,255,255,.3)",letterSpacing:1.5,textTransform:"uppercase"}}>
              <div>#</div><div>Team</div><div style={{textAlign:"center"}}>P</div><div style={{textAlign:"center"}}>W</div><div style={{textAlign:"center"}}>D</div><div style={{textAlign:"center"}}>L</div><div style={{textAlign:"center"}}>GD</div><div style={{textAlign:"center"}}>GF</div><div style={{textAlign:"center"}}>PTS</div>
            </div>
            {standings.map((t,i)=>{
              const gd=t.gf-t.ga
              return(
                <div key={t.id} className="hrow" onClick={()=>{setSelTeam(t.id);setView("team_detail")}}
                  style={{display:"grid",gridTemplateColumns:"32px 1fr 36px 36px 36px 36px 46px 46px 54px",padding:"13px 16px",borderBottom:"1px solid rgba(255,255,255,.04)",borderLeft:`3px solid ${i===0?"#e8b84b":i<4?"#5aade4":"transparent"}`,background:i===0?"rgba(232,184,75,.04)":i<4?"rgba(90,173,228,.02)":"transparent",transition:"background .12s"}}>
                  <div style={{fontSize:12,fontWeight:700,color:i===0?"#e8b84b":i<4?"#5aade4":"rgba(255,255,255,.2)"}}>{i+1}</div>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <div style={{width:9,height:9,borderRadius:"50%",background:t.color,flexShrink:0}}/>
                    <span style={{fontWeight:600,fontSize:14,whiteSpace:"nowrap"}}>{t.name}</span>
                    {i===0&&t.p>0&&<span className="pill" style={{background:"rgba(232,184,75,.15)",color:"#e8b84b"}}>LEADER</span>}
                    {i>0&&i<4&&<span className="pill" style={{background:"rgba(90,173,228,.12)",color:"#5aade4"}}>TOP 4</span>}
                  </div>
                  <div style={{textAlign:"center",fontSize:13,color:"rgba(255,255,255,.5)"}}>{t.p}</div>
                  <div style={{textAlign:"center",fontSize:13,fontWeight:600,color:"#5ae47a"}}>{t.w}</div>
                  <div style={{textAlign:"center",fontSize:13,color:"#e4c55a"}}>{t.d}</div>
                  <div style={{textAlign:"center",fontSize:13,color:"#e45a5a"}}>{t.l}</div>
                  <div style={{textAlign:"center",fontSize:13,fontWeight:600,color:gd>0?"#5ae47a":gd<0?"#e45a5a":"rgba(255,255,255,.35)"}}>{gd>0?"+":""}{gd}</div>
                  <div style={{textAlign:"center",fontSize:13,color:"rgba(255,255,255,.5)"}}>{t.gf}</div>
                  <div style={{textAlign:"center",fontSize:15,fontWeight:800,color:i===0?"#e8b84b":"#e8f4fd"}}>{t.pts}</div>
                </div>
              )
            })}
          </div>
        </div>
        {topScorers.length>0&&(
          <div style={{background:"#0d1b2a",borderRadius:14,padding:20,border:"1px solid #1e3a52"}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:"rgba(255,255,255,.3)",marginBottom:14}}>⚽ Top Scorers</div>
            {topScorers.map(([pid,{count,teamId}],i)=>{
              const team=teams.find(t=>t.id===teamId); const player=(players[teamId]||[]).find(p=>p.id===pid)
              return(
                <div key={pid} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                  <div style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,.2)",width:20,textAlign:"center"}}>{i+1}</div>
                  <div style={{width:8,height:8,borderRadius:"50%",background:team?.color||"#555",flexShrink:0}}/>
                  <div style={{flex:1,fontSize:14,fontWeight:500}}>{player?.name||"Unknown"}</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,.35)"}}>{team?.name}</div>
                  <div style={{fontSize:14,fontWeight:800,color:"#e8b84b"}}>⚽ {count}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ── MATCHES ───────────────────────────────────────────────────────────────
  const renderMatches=()=>(
    <div className="fade">
      <div style={{fontFamily:"'Bebas Neue'",fontSize:36,letterSpacing:1,marginBottom:20}}>Matches</div>
      <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
        {[1,2,3,4].map(d=>(
          <button key={d} className="btn" onClick={()=>setActiveDay(d)} style={{padding:"8px 18px",fontSize:13,background:activeDay===d?"#5aade4":"rgba(90,173,228,.1)",color:activeDay===d?"#080f1a":"#5aade4",border:"1px solid rgba(90,173,228,.3)"}}>
            Day {d}{d===4?" · Finals":""}
          </button>
        ))}
      </div>
      {(()=>{
        const dm=MATCHES.filter(m=>m.day===activeDay)
        const slots=[...new Set(dm.map(m=>m.slot))]
        return slots.map(slot=>{
          const sm=dm.filter(m=>m.slot===slot)
          return(
            <div key={slot} style={{marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.3)",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>{sm[0].time}</div>
              <div className="grid-2" style={sm.length===1?{gridTemplateColumns:"1fr"}:{}}>
                {sm.map(m=>{
                  const s=scores[m.id]||{}; const played=s.homeGoals!==undefined&&s.homeGoals!==""
                  const isLive=!!s.live; const hg=played?parseInt(s.homeGoals)||0:null; const ag=played?parseInt(s.awayGoals)||0:null
                  const snames=(s.scorers||[]).map(sc=>(players[sc.teamId]||[]).find(p=>p.id===sc.playerId)?.name?.split(" ")[0]).filter(Boolean)
                  const dyn=m.isKnockout?getKnockoutTeams(m.id):{h:m.home,a:m.away}
                  const ht=teams.find(t=>t.id===dyn.h); const at=teams.find(t=>t.id===dyn.a)
                  const canEdit=isAdmin&&(ht&&at)
                  return(
                    <div key={m.id} onClick={()=>{if(canEdit){setSelMatch(m.id);setView("score_entry")}}}
                      style={{background:"#0d1b2a",borderRadius:12,padding:16,border:`1px solid ${isLive?"rgba(228,90,90,.5)":played?"#1e3a52":"#111a27"}`,cursor:canEdit?"pointer":"default",transition:"all .15s",boxShadow:isLive?"0 0 16px rgba(228,90,90,.15)":"none"}}
                      onMouseEnter={e=>{if(canEdit)e.currentTarget.style.borderColor="#2a5a7a"}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=isLive?"rgba(228,90,90,.5)":played?"#1e3a52":"#111a27"}}>
                      {m.isKnockout&&(!ht||!at)?(
                        <div style={{textAlign:"center",padding:"10px 0"}}>
                          <div style={{fontSize:12,fontWeight:700,color:"#e8b84b",letterSpacing:1,marginBottom:6}}>{m.label}</div>
                          <div style={{fontSize:13,color:"rgba(255,255,255,.4)"}}>{m.desc}</div>
                        </div>
                      ):(
                        <>
                          {isLive&&<div style={{textAlign:"center",marginBottom:8}}><span style={{background:"rgba(228,90,90,.15)",color:"#e45a5a",fontSize:10,fontWeight:700,letterSpacing:1,padding:"3px 10px",borderRadius:99,display:"inline-flex",alignItems:"center",gap:5}}><span className="live-dot" style={{width:5,height:5}}/> LIVE</span></div>}
                          {m.isKnockout&&<div style={{fontSize:11,fontWeight:700,color:"#e8b84b",letterSpacing:1,marginBottom:8,textAlign:"center"}}>{m.label}</div>}
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{flex:1}}><div style={{fontSize:10,color:ht?.color,fontWeight:700,letterSpacing:.5,marginBottom:2}}>HOME</div><div style={{fontSize:13,fontWeight:700}}>{ht?.name||"TBD"}</div></div>
                            <div style={{textAlign:"center",minWidth:56}}>
                              {played?<div style={{fontFamily:"'Bebas Neue'",fontSize:26,letterSpacing:2,color:hg>ag?"#5ae47a":ag>hg?"#e45a5a":"#e4c55a"}}>{hg}–{ag}</div>:<div style={{fontSize:11,color:"rgba(255,255,255,.2)",fontWeight:600}}>VS</div>}
                              <div style={{fontSize:9,color:"rgba(255,255,255,.15)",marginTop:1}}>{m.id}</div>
                            </div>
                            <div style={{flex:1,textAlign:"right"}}><div style={{fontSize:10,color:at?.color,fontWeight:700,letterSpacing:.5,marginBottom:2}}>AWAY</div><div style={{fontSize:13,fontWeight:700}}>{at?.name||"TBD"}</div></div>
                          </div>
                          {played&&snames.length>0&&<div style={{marginTop:8,paddingTop:7,borderTop:"1px solid rgba(255,255,255,.05)",fontSize:11,color:"rgba(255,255,255,.3)"}}>⚽ {snames.join(", ")}</div>}
                          {canEdit&&!played&&<div style={{marginTop:6,fontSize:11,color:"rgba(90,173,228,.35)",textAlign:"center"}}>tap to enter score</div>}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })
      })()}
    </div>
  )

  // ── TEAMS ─────────────────────────────────────────────────────────────────
  const renderTeams=()=>(
    <div className="fade">
      <div style={{fontFamily:"'Bebas Neue'",fontSize:36,letterSpacing:1,marginBottom:20}}>Teams</div>
      <div className="grid-2">
        {teams.map(team=>{
          const stat=standings.find(s=>s.id===team.id)||{}; const rank=standings.findIndex(s=>s.id===team.id)+1; const pl=players[team.id]||[]
          return(
            <div key={team.id} onClick={()=>{setSelTeam(team.id);setView("team_detail")}}
              style={{background:"#0d1b2a",borderRadius:12,padding:20,border:`1px solid ${team.color}30`,cursor:"pointer",transition:"border-color .2s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=team.color+"88"}
              onMouseLeave={e=>e.currentTarget.style.borderColor=team.color+"30"}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:team.color+"25",border:`2px solid ${team.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:team.color,flexShrink:0}}>{team.name[0]}</div>
                <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>{team.name}</div>{team.nameAr!==team.name&&<div style={{fontSize:11,color:"rgba(255,255,255,.35)"}}>{team.nameAr}</div>}</div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:20,color:rank<=4?team.color:"rgba(255,255,255,.2)"}}>#{rank}</div>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:10}}>
                {[["PTS",stat.pts||0,team.color],["W",stat.w||0,"#5ae47a"],["GF",stat.gf||0,"rgba(255,255,255,.5)"]].map(([l,v,c])=>(
                  <div key={l} style={{flex:1,background:"#080f1a",borderRadius:8,padding:"8px 4px",textAlign:"center"}}>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:20,color:c,lineHeight:1}}>{v}</div>
                    <div style={{fontSize:9,color:"rgba(255,255,255,.3)",letterSpacing:1}}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.3)"}}>{pl.length} players · tap to view</div>
            </div>
          )
        })}
      </div>
    </div>
  )

  // ── ADMIN PANEL ───────────────────────────────────────────────────────────
  const renderAdminPanel=()=>(
    <div className="fade">
      <div style={{fontFamily:"'Bebas Neue'",fontSize:36,letterSpacing:1,marginBottom:6}}>Admin Panel</div>
      <div style={{fontSize:13,color:"rgba(255,255,255,.3)",marginBottom:24}}>Tournament management</div>
      <div style={{display:"flex",gap:0,marginBottom:28,borderBottom:"1px solid #1e3a52"}}>
        {[["matches","📅 Matches"],["players","👤 Edit Players"],["danger","⚠️ Danger Zone"]].map(([t,l])=>(
          <button key={t} className="nb" onClick={()=>setAdminTab(t)}
            style={{padding:"10px 16px",fontSize:13,fontWeight:600,color:adminTab===t?(t==="danger"?"#e45a5a":"#5aade4"):"rgba(255,255,255,.35)",borderBottom:`2px solid ${adminTab===t?(t==="danger"?"#e45a5a":"#5aade4"):"transparent"}`,marginBottom:-1}}>
            {l}
          </button>
        ))}
      </div>
      {adminTab==="matches"&&(
        <div>
          {[1,2,3,4].map(day=>(
            <div key={day} style={{marginBottom:20}}>
              <div style={{fontSize:11,fontWeight:700,color:"#5aade4",letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Day {day}{day===4?" · Finals":""}</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {MATCHES.filter(m=>m.day===day).map(m=>{
                  const s=scores[m.id]||{}; const played=s.homeGoals!==undefined&&s.homeGoals!==""; const isLive=!!s.live
                  const dyn=m.isKnockout?getKnockoutTeams(m.id):{h:m.home,a:m.away}
                  const ht=teams.find(t=>t.id===dyn.h); const at=teams.find(t=>t.id===dyn.a)
                  return(
                    <div key={m.id} onClick={()=>{setSelMatch(m.id);setView("score_entry")}}
                      style={{display:"flex",alignItems:"center",gap:12,background:"#0d1b2a",borderRadius:10,padding:"12px 16px",border:`1px solid ${isLive?"rgba(228,90,90,.4)":played?"#1e3a52":"#111a27"}`,cursor:"pointer"}}
                      onMouseEnter={e=>e.currentTarget.style.borderColor="#2a5a7a"}
                      onMouseLeave={e=>e.currentTarget.style.borderColor=isLive?"rgba(228,90,90,.4)":played?"#1e3a52":"#111a27"}>
                      <div style={{fontSize:11,fontWeight:700,color:isLive?"#e45a5a":played?"#5ae47a":"rgba(255,255,255,.2)",width:34,flexShrink:0}}>{m.id}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,.3)",width:80,flexShrink:0}}>{m.time}</div>
                      <div style={{flex:1,fontSize:13,fontWeight:600}}>{m.isKnockout?m.label:`${ht?.name||"?"} vs ${at?.name||"?"}`}</div>
                      {isLive&&<span style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#e45a5a",fontWeight:700}}><span className="live-dot" style={{width:5,height:5}}/>LIVE</span>}
                      {played&&!isLive&&<span style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,.5)"}}>{s.homeGoals}–{s.awayGoals}</span>}
                      {!played&&!isLive&&<span style={{fontSize:11,color:"rgba(255,255,255,.2)"}}>not played</span>}
                      <span style={{fontSize:12,color:"rgba(255,255,255,.2)"}}>→</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      {adminTab==="players"&&(
        <div>
          <div style={{fontSize:13,color:"rgba(255,255,255,.4)",marginBottom:18}}>Click any name to edit inline. Press Enter or click away to save.</div>
          {teams.map(team=>{
            const pl=players[team.id]||[]
            return(
              <div key={team.id} style={{background:"#0d1b2a",borderRadius:12,padding:20,border:"1px solid #1e3a52",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:team.color,flexShrink:0}}/>
                  <div style={{fontWeight:700,fontSize:15}}>{team.name}</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,.3)",marginLeft:"auto"}}>{pl.length} players</div>
                </div>
                {pl.map((p,idx)=>(
                  <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    <input className="tab-input" defaultValue={p.name} style={{flex:1}}
                      onBlur={e=>{const n=e.target.value.trim();if(n&&n!==p.name){const updated=pl.map((x,i)=>i===idx?{...x,name:n}:x);const u={...players,[team.id]:updated};setPlayers(u);persist("rl_players",u)}}}
                      onKeyDown={e=>{if(e.key==="Enter")e.target.blur()}}/>
                    <div style={{fontSize:10,fontWeight:700,width:52,textAlign:"right",flexShrink:0,color:p.nonPlaying?"rgba(228,90,90,.7)":p.captain?team.color:"rgba(255,255,255,.2)"}}>
                      {p.nonPlaying?"COACH":p.captain?"CAP":""}
                    </div>
                  </div>
                ))}
                <div style={{display:"flex",gap:8,marginTop:10}}>
                  <input className="tab-input" style={{flex:1}} placeholder="Add new player…" id={`add-${team.id}`}
                    onKeyDown={e=>{if(e.key==="Enter"&&e.target.value.trim()){const np={id:`${team.id}-${Date.now()}`,name:e.target.value.trim(),captain:false};const u={...players,[team.id]:[...pl,np]};setPlayers(u);persist("rl_players",u);e.target.value=""}}}/>
                  <button className="btn"
                    onClick={()=>{const inp=document.getElementById(`add-${team.id}`);if(inp?.value.trim()){const np={id:`${team.id}-${Date.now()}`,name:inp.value.trim(),captain:false};const u={...players,[team.id]:[...pl,np]};setPlayers(u);persist("rl_players",u);inp.value=""}}}
                    style={{background:"#5aade4",color:"#080f1a",padding:"8px 16px",fontSize:13,flexShrink:0}}>+ Add</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {adminTab==="danger"&&(
        <div style={{background:"rgba(228,90,90,.05)",borderRadius:12,padding:28,border:"1px solid rgba(228,90,90,.2)"}}>
          <div style={{fontSize:15,fontWeight:700,color:"#e45a5a",marginBottom:8}}>⚠️ Reset Tournament Data</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,.45)",marginBottom:24,lineHeight:1.7}}>Permanently deletes all scores, live indicators, and added players. Original registered players and teams are restored. <strong style={{color:"rgba(255,255,255,.7)"}}>Cannot be undone.</strong></div>
          <button className="btn" onClick={wipeAllData} style={{background:"rgba(228,90,90,.15)",color:"#e45a5a",border:"1px solid rgba(228,90,90,.4)",padding:"12px 24px",fontSize:14}}>🗑️ Reset All Tournament Data</button>
        </div>
      )}
    </div>
  )

  // ── SHELL ─────────────────────────────────────────────────────────────────
  return(
    <>
      <style>{CSS}</style>
      <div style={{background:"#080f1a",minHeight:"100vh",fontFamily:"'Outfit',system-ui,sans-serif",color:"#e8f4fd"}}>
        <div style={{background:"linear-gradient(180deg,#0d1f33 0%,#080f1a 100%)",borderBottom:"1px solid #141f2e",padding:"0 20px",position:"sticky",top:0,zIndex:100,backdropFilter:"blur(12px)"}}>
          <div style={{maxWidth:860,margin:"0 auto"}}>
            <div style={{padding:"14px 0 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:34,height:34,borderRadius:8,background:"linear-gradient(135deg,#5aade4,#2e7fc1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>⚽</div>
                <div>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:20,letterSpacing:2,color:"#5aade4",lineHeight:1}}>AL-RISALA</div>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:12,letterSpacing:2,color:"rgba(255,255,255,.3)",lineHeight:1}}>RAMADAN FUTSAL LEAGUE</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                {saveSt&&<span style={{fontSize:11,color:saveSt.includes("Reset")?"#e45a5a":"#5ae47a",fontWeight:700}}>{saveSt}</span>}
                {isAdmin
                  ?<button className="btn" onClick={()=>setIsAdmin(false)} style={{background:"rgba(228,90,90,.15)",color:"#e45a5a",padding:"6px 12px",fontSize:12}}>Exit Admin</button>
                  :<button className="btn" onClick={()=>setView("admin")} style={{background:"rgba(90,173,228,.1)",color:"#5aade4",padding:"6px 12px",fontSize:12,border:"1px solid rgba(90,173,228,.2)"}}>🔐 Admin</button>
                }
              </div>
            </div>
            <div style={{display:"flex",gap:0,marginTop:10}}>
              {[["standings","📊 Standings"],["matches","📅 Matches"],["teams","👥 Teams"],...(isAdmin?[["admin_panel","⚙️ Admin"]]:[])]
                .map(([v,l])=>(
                  <button key={v} className="nb" onClick={()=>setView(v)}
                    style={{padding:"10px 14px",fontSize:13,fontWeight:600,color:view===v?"#5aade4":"rgba(255,255,255,.38)",borderBottom:`2px solid ${view===v?"#5aade4":"transparent"}`}}>
                    {l}
                  </button>
                ))}
            </div>
          </div>
        </div>
        <div style={{maxWidth:860,margin:"0 auto",padding:"24px 20px 60px"}}>
          {view==="standings"   && renderStandings()}
          {view==="matches"     && renderMatches()}
          {view==="teams"       && renderTeams()}
          {view==="team_detail" && renderTeamDetail()}
          {view==="score_entry" && isAdmin && renderScoreEntry()}
          {view==="admin_panel" && isAdmin && renderAdminPanel()}
        </div>
      </div>
    </>
  )
}
