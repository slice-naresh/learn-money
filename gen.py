# -*- coding: utf-8 -*-
import json, os, base64

BASE = os.path.dirname(os.path.abspath(__file__))

# ---------- PRODUCT CATALOG ----------
# bucket: slab | flat | mixed | exempt | crypto ; anim: steady|bumpy|locked|floaty|wild
P = [
 # equity
 dict(id='stocks',icon='📊',cat='equity',bucket='flat',anim='bumpy',spread=0.12,charge=0,years=7,early=None,is80c=False,
   en=("Direct stocks","Buy a piece of one company you believe in. If it wins you win big; if it stumbles, you feel it.","<b>Example:</b> ₹10,000 in a stock growing 15%/yr → about <b>₹20,100</b> in 5 years — but it can fall hard too."),
   hi=("Direct stocks","जिस एक company पर भरोसा हो उसका हिस्सा खरीदिए। जीते तो बड़ा, गिरे तो चोट भी।","<b>उदाहरण:</b> 15%/साल बढ़ने वाले stock में ₹10,000 → 5 साल में लगभग <b>₹20,100</b> — पर तेज़ गिर भी सकता है।")),
 dict(id='equity_mf',icon='📈',cat='equity',bucket='flat',anim='bumpy',spread=0.10,charge=0.015,years=7,early=None,is80c=False,
   en=("Equity mutual fund","A pro picks a basket of stocks for you — less homework than single stocks.","<b>Example:</b> ₹10,000 at ~12%/yr → about <b>₹17,600</b> in 5 years, minus a ~1.5% yearly fee."),
   hi=("Equity mutual fund","एक expert आपके लिए stocks की टोकरी चुनता है — single stocks से कम मेहनत।","<b>उदाहरण:</b> ~12%/साल पर ₹10,000 → 5 साल में लगभग <b>₹17,600</b>, ~1.5% सालाना fee घटाकर।")),
 dict(id='index',icon='🧺',cat='equity',bucket='flat',anim='bumpy',spread=0.10,charge=0.003,years=7,early=None,is80c=False,
   en=("Index fund / ETF","Copies the whole market automatically and charges almost nothing. Simple and cheap.","<b>Example:</b> ₹10,000 at ~11.5%/yr → about <b>₹17,200</b> in 5 years, with tiny fees."),
   hi=("Index fund / ETF","पूरे market की अपने-आप नकल, fee लगभग शून्य। सरल और सस्ता।","<b>उदाहरण:</b> ~11.5%/साल पर ₹10,000 → 5 साल में लगभग <b>₹17,200</b>, बहुत कम fee के साथ।")),
 dict(id='elss',icon='🌱',cat='equity',bucket='flat',anim='bumpy',spread=0.10,charge=0.013,years=3,early=None,is80c=True,
   en=("ELSS (tax-saver fund)","An equity fund that also cuts your tax — but locked for 3 years.","<b>Example:</b> ₹10,000 grows like equity, and in the old regime it also saves tax under 80C."),
   hi=("ELSS (tax-saver fund)","equity fund जो tax भी घटाता है — पर 3 साल lock।","<b>उदाहरण:</b> ₹10,000 equity की तरह बढ़ता है, और old regime में 80C से tax भी बचाता है।")),
 dict(id='hybrid',icon='⚖️',cat='equity',bucket='mixed',anim='bumpy',spread=0.06,charge=0.012,years=5,early=None,is80c=False,
   en=("Hybrid / balanced fund","A mix of stocks and bonds in one — a smoother ride than pure stocks.","<b>Example:</b> ₹10,000 at ~10%/yr → about <b>₹16,100</b> in 5 years, with smaller swings."),
   hi=("Hybrid / balanced fund","stocks और bonds का मेल — pure stocks से नरम सवारी।","<b>उदाहरण:</b> ~10%/साल पर ₹10,000 → 5 साल में लगभग <b>₹16,100</b>, कम उतार-चढ़ाव के साथ।")),
 dict(id='reit',icon='🏢',cat='equity',bucket='mixed',anim='bumpy',spread=0.08,charge=0,years=5,early=None,is80c=False,
   en=("REIT","Own a slice of big rent-earning buildings, traded like a share.","<b>Example:</b> ₹10,000 can pay regular rent income plus grow ~9%/yr."),
   hi=("REIT","किराया कमाने वाली बड़ी इमारतों का हिस्सा, share की तरह।","<b>उदाहरण:</b> ₹10,000 नियमित rent income दे सकता है और ~9%/साल बढ़ भी सकता है।")),
 # safe
 dict(id='fd',icon='🏦',cat='safe',bucket='slab',anim='steady',spread=0.01,charge=0,years=5,early='fdPen',is80c=False,
   en=("Fixed Deposit","Like handing money to a giant, super-safe piggy bank. It pays you a little extra (interest). Catch: that extra is taxed at your salary's rate.","<b>Example:</b> ₹10,000 in an FD at 7% for 1 year → <b>₹10,700</b>. The ₹700 is interest (a slice goes to tax)."),
   hi=("Fixed Deposit","एक बड़े सुरक्षित गुल्लक को पैसा देने जैसा। थोड़ा extra (interest) देता है। पेच: वो extra आपकी salary दर पर tax होता है।","<b>उदाहरण:</b> 7% पर 1 साल FD में ₹10,000 → <b>₹10,700</b>। ₹700 interest (थोड़ा tax में)।")),
 dict(id='rd',icon='📅',cat='safe',bucket='slab',anim='steady',spread=0.01,charge=0,years=5,early=None,is80c=False,
   en=("Recurring Deposit","Like an FD you feed every month — great for building a saving habit.","<b>Example:</b> ₹2,000/month at ~6.5% → about <b>₹1.42L</b> in 5 years."),
   hi=("Recurring Deposit","हर महीने भरने वाला FD — बचत की आदत के लिए बढ़िया।","<b>उदाहरण:</b> ₹2,000/माह ~6.5% पर → 5 साल में लगभग <b>₹1.42L</b>।")),
 dict(id='savings',icon='💵',cat='safe',bucket='slab',anim='steady',spread=0.005,charge=0,years=1,early=None,is80c=False,
   en=("Savings account","Your everyday account. Super handy, but barely grows.","<b>Example:</b> ₹10,000 at 3% → just ₹10,300 after a year; inflation eats most of it."),
   hi=("Savings account","रोज़मर्रा का खाता। बहुत काम का, पर मुश्किल से बढ़ता है।","<b>उदाहरण:</b> 3% पर ₹10,000 → साल बाद सिर्फ़ ₹10,300; ज़्यादातर inflation खा जाता है।")),
 dict(id='corp_fd',icon='🏬',cat='safe',bucket='slab',anim='steady',spread=0.04,charge=0,years=3,early=None,is80c=False,
   en=("Corporate / NBFC FD","Like a bank FD but from a company — pays more, but riskier and not insured.","<b>Example:</b> ₹10,000 at 8% → ₹10,800 in a year, if the company stays healthy."),
   hi=("Corporate / NBFC FD","बैंक FD जैसा पर company से — ज़्यादा देता है, पर जोखिम और बिना insurance।","<b>उदाहरण:</b> 8% पर ₹10,000 → साल में ₹10,800, अगर company ठीक रहे।")),
 # govt
 dict(id='ppf',icon='🛡️',cat='govt',bucket='exempt',anim='locked',spread=0.005,charge=0,years=15,early='ppfLock',is80c=True,
   en=("PPF","A government piggy bank with a 15-year lock. Grows safely and the government never takes a rupee of it in tax.","<b>Example:</b> ₹10,000/year for 15 years (₹1.5L total) → about <b>₹2.7L</b> at 7.1%, with <b>₹0 tax</b>."),
   hi=("PPF","15 साल lock वाला सरकारी गुल्लक। सुरक्षित बढ़ता है और सरकार एक रुपया भी tax नहीं लेती।","<b>उदाहरण:</b> 15 साल हर साल ₹10,000 (कुल ₹1.5L) → 7.1% पर लगभग <b>₹2.7L</b>, <b>₹0 tax</b>।")),
 dict(id='epf',icon='👷',cat='govt',bucket='exempt',anim='locked',spread=0.005,charge=0,years=15,early=None,is80c=False,
   en=("EPF / VPF","Retirement savings auto-cut from your salary; your employer adds a matching bit.","<b>Example:</b> ₹5,000/month from you + employer match grows at ~8.25%, mostly tax-free."),
   hi=("EPF / VPF","salary से अपने-आप कटने वाली retirement बचत; employer बराबर हिस्सा जोड़ता है।","<b>उदाहरण:</b> आपके ₹5,000/माह + employer का हिस्सा ~8.25% पर बढ़ता है, ज़्यादातर tax-free।")),
 dict(id='nps',icon='🪺',cat='govt',bucket='exempt',anim='locked',spread=0.06,charge=0.001,years=20,early=None,is80c=False,
   en=("NPS","A retirement pot you grow till 60; part becomes a monthly pension later.","<b>Example:</b> 60% of the corpus comes out tax-free at 60; 40% buys a pension that is then taxed."),
   hi=("NPS","60 की उम्र तक बढ़ने वाला retirement पॉट; आगे चलकर हिस्सा मासिक pension बनता है।","<b>उदाहरण:</b> 60 पर corpus का 60% tax-free मिलता है; 40% से pension बनती है जिस पर tax लगता है।")),
 dict(id='ssy',icon='👧',cat='govt',bucket='exempt',anim='locked',spread=0.003,charge=0,years=15,early=None,is80c=True,
   en=("Sukanya Samriddhi (SSY)","A special tax-free account for a daughter's future. Locked till she's grown.","<b>Example:</b> ₹10,000/year for a girl child grows tax-free at ~8.2% till she turns 21."),
   hi=("Sukanya Samriddhi (SSY)","बेटी के भविष्य के लिए खास tax-free खाता। बड़ी होने तक lock।","<b>उदाहरण:</b> बेटी के लिए ₹10,000/साल ~8.2% पर tax-free बढ़ता है, 21 साल तक।")),
 dict(id='scss',icon='👴',cat='govt',bucket='slab',anim='steady',spread=0.005,charge=0,years=5,early=None,is80c=True,
   en=("Senior Citizens Scheme (SCSS)","A safe scheme for people 60+, paying steady interest every quarter.","<b>Example:</b> ₹10L at ~8.2% pays about ₹82,000 a year (taxed at your slab)."),
   hi=("Senior Citizens Scheme (SCSS)","60+ के लिए सुरक्षित योजना, हर तिमाही स्थिर ब्याज़।","<b>उदाहरण:</b> ~8.2% पर ₹10L सालाना लगभग ₹82,000 देता है (आपके slab पर tax)।")),
 dict(id='apy',icon='🧓',cat='govt',bucket='slab',anim='steady',spread=0.005,charge=0,years=20,early=None,is80c=False,
   en=("Atal Pension Yojana","A government pension for everyone — pay a little now, get a fixed pension later.","<b>Example:</b> Small monthly payments now → a guaranteed ₹1,000–₹5,000/month pension after 60."),
   hi=("Atal Pension Yojana","सबके लिए सरकारी pension — अभी थोड़ा दीजिए, आगे तय pension पाइए।","<b>उदाहरण:</b> अभी छोटे मासिक भुगतान → 60 के बाद तय ₹1,000–₹5,000/माह pension।")),
 dict(id='post_office',icon='📮',cat='govt',bucket='slab',anim='steady',spread=0.005,charge=0,years=5,early=None,is80c=False,
   en=("Post Office (NSC/KVP/POMIS)","Government-backed savings at the post office — boringly safe.","<b>Example:</b> ₹10,000 in NSC at ~7.5% becomes about ₹14,400 in 5 years."),
   hi=("Post Office (NSC/KVP/POMIS)","डाकघर की सरकारी बचत — ऊबाऊ हद तक सुरक्षित।","<b>उदाहरण:</b> ~7.5% पर NSC में ₹10,000 → 5 साल में लगभग ₹14,400।")),
 # bonds
 dict(id='gsec',icon='🏛️',cat='bonds',bucket='slab',anim='steady',spread=0.01,charge=0,years=5,early=None,is80c=False,
   en=("Government bonds (G-Sec)","Lend money to the government itself — the safest rupee investment there is.","<b>Example:</b> ₹10,000 at ~7% pays ₹700/year interest (taxed at your slab)."),
   hi=("Government bonds (G-Sec)","खुद सरकार को उधार — रुपये में सबसे सुरक्षित निवेश।","<b>उदाहरण:</b> ~7% पर ₹10,000 सालाना ₹700 ब्याज़ देता है (आपके slab पर tax)।")),
 dict(id='corp_bond',icon='🧾',cat='bonds',bucket='slab',anim='steady',spread=0.03,charge=0,years=5,early=None,is80c=False,
   en=("Corporate bonds / NCDs","Lend to a company for fixed interest — more than a bank, but watch the risk.","<b>Example:</b> ₹10,000 at ~8.5% pays ₹850/year, if the company doesn't default."),
   hi=("Corporate bonds / NCDs","company को उधार, तय ब्याज़ — बैंक से ज़्यादा, पर जोखिम देखिए।","<b>उदाहरण:</b> ~8.5% पर ₹10,000 सालाना ₹850 देता है, अगर company default न करे।")),
 dict(id='rbi_frsb',icon='🇮🇳',cat='bonds',bucket='slab',anim='steady',spread=0.005,charge=0,years=7,early=None,is80c=False,
   en=("RBI Floating Rate Bond","A government bond whose interest floats with the market — locked 7 years.","<b>Example:</b> ₹10,000 at ~8.05% pays about ₹805/year (taxed at your slab)."),
   hi=("RBI Floating Rate Bond","सरकारी बॉन्ड जिसका ब्याज़ market के साथ बदलता है — 7 साल lock।","<b>उदाहरण:</b> ~8.05% पर ₹10,000 सालाना लगभग ₹805 देता है (आपके slab पर tax)।")),
 dict(id='tax_free_bonds',icon='🎟️',cat='bonds',bucket='exempt',anim='locked',spread=0.005,charge=0,years=10,early=None,is80c=False,
   en=("Tax-free bonds","Old government-backed bonds whose interest is completely tax-free.","<b>Example:</b> ₹10,000 at 5.5% tax-free ≈ about 8% pre-tax for a 30%-slab person."),
   hi=("Tax-free bonds","पुराने सरकारी समर्थित बॉन्ड जिनका ब्याज़ पूरी तरह tax-free है।","<b>उदाहरण:</b> 5.5% tax-free ≈ 30% slab वाले के लिए लगभग 8% pre-tax जैसा।")),
 dict(id='tbill_sdl',icon='📜',cat='bonds',bucket='slab',anim='steady',spread=0.01,charge=0,years=3,early=None,is80c=False,
   en=("T-Bills / SDLs","Very short government IOUs — park money safely for under a year.","<b>Example:</b> Buy a ₹9,650 T-Bill, get ₹10,000 back in a year — the ₹350 is your return."),
   hi=("T-Bills / SDLs","बहुत छोटी अवधि के सरकारी IOU — साल से कम के लिए सुरक्षित पार्किंग।","<b>उदाहरण:</b> ₹9,650 का T-Bill लीजिए, साल बाद ₹10,000 — ₹350 आपका return।")),
 # gold
 dict(id='gold_etf',icon='🥇',cat='gold',bucket='mixed',anim='floaty',spread=0.08,charge=0.006,years=5,early=None,is80c=False,
   en=("Gold ETF","Gold you keep on your phone instead of as a chain. No locker, no jeweller's charges.","<b>Example:</b> ₹10,000 of gold → about ₹15,000 in 5 years if gold rises ~9%/yr (can fall too)."),
   hi=("Gold ETF","चेन के बजाय फ़ोन में सोना। कोई locker नहीं, कोई जौहरी की fee नहीं।","<b>उदाहरण:</b> ₹10,000 का सोना → 5 साल में लगभग ₹15,000 अगर सोना ~9%/साल बढ़े (गिर भी सकता है)।")),
 dict(id='gold_physical',icon='💍',cat='gold',bucket='mixed',anim='floaty',spread=0.08,charge=0,years=5,early=None,is80c=False,
   en=("Physical gold","Real gold — coins or jewellery. Pretty, but you pay extra to make and store it.","<b>Example:</b> ₹10,000 of jewellery loses 10–25% to making charges before it even grows."),
   hi=("Physical gold","असली सोना — सिक्के या गहने। सुंदर, पर बनवाने-रखने का extra खर्च।","<b>उदाहरण:</b> ₹10,000 के गहने बढ़ने से पहले 10–25% making charge में गँवा देते हैं।")),
 dict(id='sgb',icon='🪙',cat='gold',bucket='mixed',anim='floaty',spread=0.08,charge=0,years=8,early=None,is80c=False,
   en=("Sovereign Gold Bond","Government gold bonds that also paid 2.5% interest. No new ones are sold now.","<b>Example:</b> Held to maturity by the first buyer, the price gain came out fully tax-free."),
   hi=("Sovereign Gold Bond","सरकारी सोना-बॉन्ड जो 2.5% ब्याज़ भी देते थे। अब नए नहीं बिकते।","<b>उदाहरण:</b> पहले खरीदार द्वारा maturity तक रखने पर भाव का फ़ायदा पूरी तरह tax-free मिला।")),
 # advanced
 dict(id='debt_mf',icon='📉',cat='advanced',bucket='slab',anim='steady',spread=0.03,charge=0.005,years=5,early=None,is80c=False,
   en=("Debt mutual fund","A fund that lends your money out for steady interest. Calmer than stocks.","<b>Example:</b> ₹10,000 at ~7.5% → about ₹14,400 in 5 years, all taxed at your slab now."),
   hi=("Debt mutual fund","आपका पैसा उधार देकर स्थिर ब्याज़ कमाने वाला fund। stocks से शांत।","<b>उदाहरण:</b> ~7.5% पर ₹10,000 → 5 साल में लगभग ₹14,400, अब सब आपके slab पर tax।")),
 dict(id='crypto',icon='🪩',cat='advanced',bucket='crypto',anim='wild',spread=0.30,charge=0,years=3,early=None,is80c=False,
   en=("Crypto","Digital coins like Bitcoin — wild swings, and India taxes gains a flat 30%.","<b>Example:</b> ₹10,000 could double… or halve. Any profit is taxed <b>30%</b>, and losses can't be set off."),
   hi=("Crypto","Bitcoin जैसे digital सिक्के — ज़बरदस्त उतार-चढ़ाव, और India में gains पर flat 30% tax।","<b>उदाहरण:</b> ₹10,000 दोगुना… या आधा हो सकता है। मुनाफ़े पर <b>30%</b> tax, और नुकसान set-off नहीं होते।")),
 dict(id='foreign',icon='🌎',cat='advanced',bucket='mixed',anim='bumpy',spread=0.12,charge=0,years=7,early=None,is80c=False,
   en=("Foreign stocks (US)","Buy US shares like Apple from India. Currency moves matter too.","<b>Example:</b> ₹10,000 in US stocks; gains over 2 years taxed at 12.5% — no ₹1.25L free limit."),
   hi=("Foreign stocks (US)","India से Apple जैसे US shares खरीदिए। currency का असर भी पड़ता है।","<b>उदाहरण:</b> US stocks में ₹10,000; 2 साल से ऊपर के gains पर 12.5% tax — कोई ₹1.25L छूट नहीं।")),
 dict(id='intl_mf',icon='🌐',cat='advanced',bucket='mixed',anim='bumpy',spread=0.10,charge=0.012,years=7,early=None,is80c=False,
   en=("International funds","An Indian fund that invests abroad for you — no paperwork hassle.","<b>Example:</b> ₹10,000 tracking global markets; held over 2 years, gains taxed at 12.5%."),
   hi=("International funds","आपके लिए विदेश में निवेश करने वाला Indian fund — कोई कागज़ी झंझट नहीं।","<b>उदाहरण:</b> global markets पर ₹10,000; 2 साल से ऊपर रखने पर gains 12.5% tax।")),
 dict(id='ulip',icon='📑',cat='advanced',bucket='exempt',anim='bumpy',spread=0.06,charge=0.02,years=5,early=None,is80c=True,
   en=("ULIP (Unit-Linked Insurance Plan)","One policy that does two jobs: it gives you life insurance AND invests your money in stock/bond funds you choose. Part of each premium pays for the life cover; the rest is invested, so returns rise and fall with the market. Locked 5 years, and several charges come off the top.","<b>Example:</b> Pay ₹10,000/yr — some buys life cover, some goes to charges, the rest is invested. Because of those charges it usually trails a plain index fund + a separate term plan."),
   hi=("ULIP (Unit-Linked Insurance Plan)","एक पॉलिसी, दो काम: life insurance भी और आपका पैसा chosen funds में निवेश भी। हर premium का एक हिस्सा cover के लिए, बाकी निवेश — return market के साथ बदलता है। 5 साल lock, और कई charges पहले कटते हैं।","<b>उदाहरण:</b> ₹10,000/साल — कुछ cover में, कुछ charges में, बाकी निवेश। charges के कारण आम index fund + अलग term plan से पीछे रहता है।")),
 dict(id='endowment',icon='🛟',cat='advanced',bucket='exempt',anim='locked',spread=0.01,charge=0.015,years=20,early=None,is80c=True,
   en=("Endowment / money-back (LIC-style)","A traditional insurance-plus-savings policy. It pays your family if something happens to you, and returns a guaranteed lump sum (or periodic 'money-back') if you survive the term. Very safe, but the returns are low — usually 4–6%.","<b>Example:</b> ₹50,000/yr for 20 years might return about ₹15–18L (~4–6%). The same money in an index fund could grow far more — that's the cost of mixing insurance with investing."),
   hi=("Endowment / money-back (LIC जैसी)","पारंपरिक insurance+बचत पॉलिसी। आपको कुछ हो तो परिवार को भुगतान, और term पूरा होने पर तय lump sum (या बीच-बीच में 'money-back')। बहुत सुरक्षित, पर return कम — आम तौर पर 4–6%।","<b>उदाहरण:</b> 20 साल ₹50,000/साल → लगभग ₹15–18L (~4–6%)। वही पैसा index fund में कहीं ज़्यादा बढ़ सकता है — insurance और निवेश मिलाने की यही कीमत है।")),
 dict(id='real_estate',icon='🏠',cat='advanced',bucket='mixed',anim='steady',spread=0.05,charge=0,years=10,early=None,is80c=False,
   en=("Real estate","Buy property to rent out and (hopefully) sell higher. Big money, slow to sell.","<b>Example:</b> A ₹50L flat: stamp duty + registration alone can cost ₹3L+ upfront."),
   hi=("Real estate","किराये और (उम्मीद से) ऊँचे दाम पर बेचने के लिए property। बड़ा पैसा, बेचना धीमा।","<b>उदाहरण:</b> ₹50L का flat: सिर्फ़ stamp duty + registration ही ₹3L+ शुरू में।")),
]

DEFAULT_ACTIVE = {}   # blank slate — user picks their own products

CATS = [
 ('equity','Stocks & funds','शेयर व funds'),
 ('safe','Safe & guaranteed','सुरक्षित व गारंटीड'),
 ('govt','Govt schemes','सरकारी योजनाएँ'),
 ('bonds','Bonds','बॉन्ड'),
 ('gold','Gold','सोना'),
 ('advanced','Advanced & risky','एडवांस व जोखिम'),
]

# plain-language "how it behaves" line per animation/behaviour type (replaces the old abstract SVGs)
BEHAV = {
 'steady': ("Grows slowly and steadily. Very safe — few surprises.",
            "धीरे और स्थिर बढ़ता है। बहुत सुरक्षित — कम झटके।"),
 'bumpy':  ("Goes up and down a lot. Can grow well over many years, but expect drops along the way.",
            "काफ़ी ऊपर-नीचे होता है। कई सालों में अच्छा बढ़ सकता है, पर बीच में गिरावट आती है।"),
 'wild':   ("Swings violently — can shoot up or crash fast. Only use money you can afford to lose.",
            "ज़बरदस्त उतार-चढ़ाव — तेज़ी से बढ़ या गिर सकता है। सिर्फ़ वही पैसा लगाइए जो खोने का जोखिम ले सकें।"),
 'locked': ("Your money is locked in for years. In return it stays safe and grows quietly.",
            "आपका पैसा कई साल lock रहता है। बदले में सुरक्षित रहता है और चुपचाप बढ़ता है।"),
 'floaty': ("Tracks the price of gold — it drifts up and down with the market.",
            "सोने के भाव के साथ चलता है — market के साथ ऊपर-नीचे होता रहता है।"),
}

# one-line "Good for / Watch" tip per product (English; literacy lessons)
TIP = {
 'stocks':"Good for: long-term growth if you'll research and stomach swings. Watch: one company can crash hard.",
 'equity_mf':"Good for: hands-off equity growth. Watch: a ~1–1.5%/yr fee quietly eats returns.",
 'index':"Good for: cheap, simple market growth. Watch: you get the market — no more, no less.",
 'elss':"Good for: equity growth plus an 80C tax break. Watch: 3-year lock-in.",
 'hybrid':"Good for: a smoother stock-and-bond mix. Watch: less upside than pure equity.",
 'reit':"Good for: rental-style income without buying property. Watch: price moves with markets.",
 'fd':"Good for: safety and certainty. Watch: interest taxed at your slab; often trails inflation.",
 'rd':"Good for: building a monthly saving habit. Watch: modest, slab-taxed returns.",
 'savings':"Good for: everyday access. Watch: barely grows — inflation eats it.",
 'corp_fd':"Good for: higher interest than a bank FD. Watch: not insured; the company can default.",
 'ppf':"Good for: safe, fully tax-free long-term growth plus 80C. Watch: 15-year lock-in.",
 'epf':"Good for: automatic retirement savings with an employer match. Watch: mostly locked till retirement.",
 'nps':"Good for: a low-cost retirement pot plus an extra 80CCD(1B) break. Watch: locked till 60; part of the payout is taxed.",
 'ssy':"Good for: a daughter's future, tax-free. Watch: girl-child only; locked till she's grown.",
 'scss':"Good for: seniors wanting steady, safe income. Watch: age 60+; interest is slab-taxed.",
 'apy':"Good for: a guaranteed small pension for everyone. Watch: fixed, modest payout.",
 'post_office':"Good for: government-safe small savings. Watch: modest, slab-taxed returns.",
 'gsec':"Good for: the safest rupee interest there is. Watch: slab-taxed; price moves if sold early.",
 'corp_bond':"Good for: more interest than government bonds. Watch: company credit risk; slab-taxed.",
 'rbi_frsb':"Good for: government safety with a floating rate. Watch: 7-year lock; slab-taxed.",
 'tax_free_bonds':"Good for: tax-free interest — great for high earners. Watch: only on the secondary market now; long tenure.",
 'tbill_sdl':"Good for: parking money safely for under a year. Watch: low returns; slab-taxed.",
 'gold_etf':"Good for: easy digital gold, no storage hassle. Watch: earns no income; price swings.",
 'gold_physical':"Good for: jewellery you can actually wear. Watch: 10–25% making charges; storage risk.",
 'sgb':"Good for: gold plus 2.5% interest, tax-free at maturity. Watch: no new issues; long tenure.",
 'debt_mf':"Good for: steadier-than-equity returns. Watch: slab-taxed now; small fee.",
 'crypto':"Good for: a tiny, high-risk punt only. Watch: wild swings; flat 30% tax; losses can't offset.",
 'foreign':"Good for: owning global giants, with currency exposure. Watch: currency risk; no ₹1.25L exemption.",
 'intl_mf':"Good for: easy global exposure from India. Watch: fees; taxed as a mixed asset.",
 'ulip':"Good for: insurance and investment in one. Watch: high charges usually trail a simple fund.",
 'endowment':"Good for: ultra-safe, guaranteed savings with life cover + 80C. Watch: low (4–6%) returns — term insurance + an index fund usually beats it.",
 'real_estate':"Good for: rental income plus long-term value. Watch: huge upfront costs; slow to sell.",
}

# Deep multi-section lessons (English). Rolling out category by category; equity first.
# Facts (returns, lock-ins, tax) are illustrative FY2026-27 and pending CA review.
LESSON = {
 'stocks':dict(
   what="Buying shares of a single listed company makes you a part-owner. You profit if the share price rises, and from any dividends the company pays.",
   works="You buy and sell on a stock exchange (NSE/BSE) through a demat + trading account. The price moves second by second with the company's results and overall market mood.",
   returns="No fixed return. Strong companies have historically compounded ~12–15%/yr over long periods, but any single stock can do far better — or lose most of its value.",
   risk="High and concentrated. One company can collapse on bad results, fraud or a sector shock. You have no diversification unless you deliberately buy many stocks.",
   liquidity="Very liquid for large companies — they sell in seconds during market hours. Smaller companies can be harder to exit at a fair price.",
   tax="Listed equity: gains held over 1 year are long-term, taxed at 12.5% with the first ₹1.25L of equity gains each year tax-free. Under 1 year is short-term at 20%. Dividends are taxed at your slab.",
   costs="Brokerage, exchange fees, STT and GST on each trade — small individually, but they add up if you trade often. No annual holding fee.",
   forwhom="People willing to research companies, hold for years, and stay calm through sharp ups and downs.",
   pros=["Highest long-term growth potential","You choose exactly what you own","Earn from price gains and dividends","Very liquid"],
   cons=["A single company can crash hard","Needs research and emotional discipline","No built-in diversification","Easy to over-trade and lose"]),
 'equity_mf':dict(
   what="A professionally managed fund that pools money from many investors and buys a basket of stocks — so one purchase gives you a slice of dozens of companies.",
   works="A fund manager picks and rebalances the holdings. You buy 'units' at the day's NAV; the fund's value rises and falls with its stocks. You can invest a lump sum or a monthly SIP.",
   returns="Aims to grow with the equity market, ~10–13%/yr over long periods. Actively managed funds try to beat the index, but many fail to after fees.",
   risk="Market risk like stocks, but spread across many companies, so one failure hurts far less. It still falls in a market downturn.",
   liquidity="Open-ended funds redeem in 1–3 working days. (ELSS funds have a lock-in — see ELSS.)",
   tax="Taxed as listed equity: long-term (over 1 year) 12.5% with ₹1.25L/yr exemption; short-term 20%.",
   costs="An annual expense ratio (~0.5–1.5%) charged on your whole balance every year — it quietly compounds against you, so lower is better.",
   forwhom="Most people who want equity growth without picking individual stocks.",
   pros=["Instant diversification","Professionally managed","SIP makes investing automatic","Easy to start small"],
   cons=["Annual fee drags on returns","Many active funds trail the index","Still falls in market crashes","Overwhelming number of choices"]),
 'index':dict(
   what="A fund that simply copies a market index (like the Nifty 50) instead of trying to beat it — you own the whole market in one cheap product.",
   works="It holds the same stocks as the index in the same proportions, tracking the market automatically with almost no human judgement. ETFs trade like a share; index funds are bought at NAV.",
   returns="Matches the market minus a tiny fee — historically ~11–12%/yr long term. You won't beat the market, but you also won't badly trail it.",
   risk="Full market risk — it falls when the market falls. But there's no single-stock risk and no fund-manager risk.",
   liquidity="Index funds redeem in 1–3 days; ETFs sell instantly on the exchange during market hours.",
   tax="Listed-equity rules: long-term 12.5% (₹1.25L/yr free), short-term 20%.",
   costs="The lowest fees around — often 0.1–0.3%/yr. That cost edge compounds into a big advantage over decades.",
   forwhom="Almost everyone — the simplest, cheapest core of a long-term portfolio.",
   pros=["Rock-bottom fees","Broad diversification","No fund-manager risk","Simple and transparent"],
   cons=["Never beats the market","Falls fully in crashes","ETFs need a demat account","'Boring' (which is actually fine)"]),
 'elss':dict(
   what="An equity mutual fund that also gives a tax deduction under Section 80C — the only equity product that saves you tax.",
   works="It invests in stocks like any equity fund, but each investment is locked for 3 years. Up to ₹1.5L a year counts toward 80C in the old tax regime.",
   returns="Equity-like, ~10–13%/yr over long periods.",
   risk="Equity market risk, plus you cannot exit for 3 years even if you suddenly need the money.",
   liquidity="A hard 3-year lock-in per investment — though that's the shortest lock-in among all 80C options.",
   tax="80C deduction up to ₹1.5L (old regime only). Gains taxed as equity: long-term 12.5%, ₹1.25L/yr free.",
   costs="An expense ratio like other active equity funds (~1–1.5%/yr).",
   forwhom="Old-regime taxpayers who want equity growth and a tax break in the same product.",
   pros=["Tax deduction under 80C","Full equity growth","Shortest 80C lock-in (3 years)","SIP-friendly"],
   cons=["3-year lock-in","Only useful in the old regime","Active-fund fees","Market risk"]),
 'hybrid':dict(
   what="A single fund that mixes stocks and bonds, aiming for a smoother ride than pure equity.",
   works="The manager holds a blend (for example 65% equity / 35% debt) and rebalances it. The bond part cushions falls; the equity part drives growth.",
   returns="Sits between equity and debt — typically ~8–11%/yr, with smaller swings than pure stocks.",
   risk="Moderate. It falls less than equity in a crash, but also rises less in a boom.",
   liquidity="Open-ended; redeems in 1–3 working days.",
   tax="Depends on the equity share: funds with at least 65% equity are taxed as equity (12.5% long-term); more debt-heavy ones are taxed at your slab. Check the specific fund.",
   costs="Expense ratio ~1–1.5%/yr.",
   forwhom="First-time or cautious investors who want equity exposure with less stomach-churn.",
   pros=["Smoother than pure equity","Automatic rebalancing","One-fund simplicity","Good starter fund"],
   cons=["Lower upside than equity","Annual fee","Tax depends on the mix","Still carries market risk"]),
 'reit':dict(
   what="A Real Estate Investment Trust lets you own a slice of large rent-earning commercial buildings, traded on the exchange like a share.",
   works="The REIT owns offices and malls, collects rent, and must pay most of it out to investors. You earn regular distributions plus any rise in the unit price.",
   returns="Typically a ~6–8% distribution yield plus modest price growth — total ~8–10%/yr, varying with the property market and interest rates.",
   risk="Property-market and interest-rate risk, and the unit price swings with the stock market too. Less diversified than an equity fund.",
   liquidity="Listed REITs trade on the exchange during market hours — far more liquid than owning an actual building.",
   tax="Mixed: distributions can be part interest (slab-taxed), part dividend and part return-of-capital; unit gains follow the holding period. Treat it as a mixed asset.",
   costs="Brokerage to buy and sell; the REIT also has its own management costs built in.",
   forwhom="Investors who want real-estate income without buying or managing property themselves.",
   pros=["Regular rental-style income","No property or tenant hassle","Liquid, unlike real estate","Small ticket size"],
   cons=["Price swings with the market","Sensitive to interest rates","Complex taxation","Few options in India so far"]),

 # --- SAFE ---
 'fd':dict(
   what="You lock a sum with a bank for a fixed term; it pays a fixed, guaranteed rate of interest.",
   works="You choose the amount and tenure (7 days to 10 years). The bank pays a pre-agreed rate and returns your principal plus interest at maturity (or pays interest periodically).",
   returns="Fixed and modest — about 6.5–7.5%/yr depending on bank and tenure. Senior citizens usually get ~0.5% extra.",
   risk="Very low — bank FDs are insured up to ₹5L per bank by DICGC. The real 'risk' is that the return often barely beats inflation.",
   liquidity="Breakable any time, but early withdrawal usually costs a ~0.5–1% rate penalty.",
   tax="Interest is taxed at your slab every year (even if not withdrawn); TDS applies above ₹40k (₹50k for seniors).",
   costs="None to open. A penalty only if you break it early.",
   forwhom="Anyone wanting guaranteed safety for short-to-medium goals or an emergency buffer.",
   pros=["Capital safe + insured to ₹5L","Guaranteed, predictable return","No market risk","Easy to open"],
   cons=["Returns often trail inflation","Interest fully slab-taxed","Penalty for breaking early","Locks your rate even if rates rise"]),
 'rd':dict(
   what="Like an FD you feed monthly — you deposit a fixed amount every month for a set term at a fixed rate.",
   works="You commit a monthly amount (say ₹2,000) for 6 months–10 years; each deposit earns the fixed rate until maturity.",
   returns="Similar to FDs, about 6–7%/yr.",
   risk="Very low; bank-backed with the same ₹5L DICGC insurance.",
   liquidity="Premature closure allowed with a small penalty; missing instalments may attract a fee.",
   tax="Interest taxed at your slab; TDS rules like FDs.",
   costs="None; penalty for early closure or missed instalments.",
   forwhom="People building a saving habit from monthly income without a lump sum to start.",
   pros=["Builds monthly discipline","Guaranteed and bank-safe","Start small (₹500/mo)","Predictable maturity value"],
   cons=["Modest, slab-taxed returns","Penalty for missed instalments","Trails inflation","Locked rate"]),
 'savings':dict(
   what="Your everyday bank account — holds cash you can spend any time and pays a little interest.",
   works="Money stays available for spending and withdrawal; the bank pays a small interest on the balance, usually credited quarterly.",
   returns="Very low, about 2.5–4%/yr — well below inflation.",
   risk="Minimal; insured to ₹5L. The real risk is leaving too much idle here and quietly losing value to inflation.",
   liquidity="The most liquid of all — instant access via card, UPI or ATM.",
   tax="Interest taxed at slab, but 80TTA makes up to ₹10,000/yr of it tax-free (₹50,000 for seniors via 80TTB) in the old regime.",
   costs="Usually none; some accounts need a minimum balance.",
   forwhom="Everyone — for daily money and a small emergency float, not for growth.",
   pros=["Instant access anytime","Bank-safe","No lock-in","80TTA interest break"],
   cons=["Barely grows","Inflation erodes idle cash","Tempting to overspend","Low rate"]),
 'corp_fd':dict(
   what="A fixed deposit from a company or NBFC instead of a bank — higher interest, but higher risk.",
   works="Same idea as a bank FD, but you're lending to a company, so the rate is higher to compensate for the extra risk.",
   returns="Higher than bank FDs, about 7.5–9%/yr depending on the issuer's credit rating.",
   risk="Higher — NOT covered by the ₹5L bank insurance. If the company defaults you can lose money. Check the credit rating (AAA is safest).",
   liquidity="Often locked; premature withdrawal is restricted or penalised.",
   tax="Interest taxed at your slab.",
   costs="None to invest; the real cost is default risk.",
   forwhom="Investors comfortable with some credit risk for extra yield, sticking to highly rated issuers.",
   pros=["Higher rate than bank FDs","Fixed, predictable income","Choice of tenures","Higher senior rates"],
   cons=["Not insured","Company default risk","Less liquid","Slab-taxed"]),

 # --- GOVT ---
 'ppf':dict(
   what="A government-backed long-term savings scheme with a 15-year term that grows safely and fully tax-free.",
   works="You deposit ₹500–₹1.5L per year; the government sets the interest (~7.1%) each quarter. It's locked for 15 years, extendable in 5-year blocks.",
   returns="About 7.1%/yr, compounded yearly — modest, but completely tax-free and government-guaranteed.",
   risk="Effectively zero — sovereign-backed.",
   liquidity="Very low — 15-year lock; partial withdrawals only from year 7, loans from year 3.",
   tax="EEE — the deposit qualifies for 80C (up to ₹1.5L), and both the interest and the maturity amount are fully tax-free.",
   costs="None.",
   forwhom="Long-term, safety-first savers and anyone wanting guaranteed tax-free retirement money.",
   pros=["Fully tax-free (EEE)","Government-guaranteed","80C deduction","Compounds quietly for decades"],
   cons=["15-year lock-in","₹1.5L/yr cap","Modest rate","Rate can change quarterly"]),
 'epf':dict(
   what="A retirement fund for salaried employees — part of your salary is auto-saved monthly and your employer matches some of it.",
   works="12% of basic pay is deducted and the employer adds a matching contribution. It earns a government-declared rate (~8.25%). VPF lets you contribute extra voluntarily.",
   returns="About 8.25%/yr — one of the best risk-free rates available, and largely tax-free.",
   risk="Very low — government-managed.",
   liquidity="Low — meant for retirement; partial withdrawals allowed for specific needs (home, medical, etc.).",
   tax="Largely EEE; but interest on your own contributions above ₹2.5L/yr (₹5L if there's no employer contribution) is taxable.",
   costs="None.",
   forwhom="Salaried employees — it's automatic, and VPF is a great way to save more, safely.",
   pros=["Employer match = free money","High, near-tax-free rate","Automatic discipline","Government-backed"],
   cons=["Mostly locked till retirement","EPF is for salaried only","High-contribution interest is taxed","Strict withdrawal rules"]),
 'nps':dict(
   what="A low-cost retirement scheme where you build a pot until age 60, invested across equity and debt of your choice.",
   works="You contribute regularly; fund managers invest it across equity and bonds per your chosen mix. At 60 you take part as cash and must use the rest to buy a pension (annuity).",
   returns="Market-linked, about 8–10%/yr long term depending on your equity allocation.",
   risk="Moderate — depends on your equity share; more equity means more swings.",
   liquidity="Very low — largely locked till 60, with only limited partial withdrawals.",
   tax="80C plus an extra ₹50,000 under 80CCD(1B). At 60, 60% of the corpus is tax-free; the 40% annuity is taxed as income later. (Shown simplified here.)",
   costs="Among the cheapest managed products — very low fund-management fees.",
   forwhom="People building a disciplined, low-cost retirement corpus who want an extra tax break.",
   pros=["Extra ₹50k tax break (80CCD1B)","Very low fees","Equity growth option","60% tax-free at 60"],
   cons=["Locked till 60","Forced annuity on 40%","Annuity income is taxed","Returns not guaranteed"]),
 'ssy':dict(
   what="A government scheme for a girl child's future — a tax-free account opened by parents, locked until she grows up.",
   works="Open it before the girl turns 10; deposit ₹250–₹1.5L/yr for 15 years. It earns a government rate (~8.2%) and matures when she turns 21 (or on marriage after 18).",
   returns="About 8.2%/yr, tax-free — among the highest guaranteed rates available.",
   risk="Effectively zero — sovereign-backed.",
   liquidity="Very low — long lock; a 50% partial withdrawal is allowed for higher education after she turns 18.",
   tax="EEE — 80C deduction, with tax-free interest and maturity.",
   costs="None.",
   forwhom="Parents of a girl child saving for her education or marriage.",
   pros=["High tax-free rate","Government-guaranteed","80C deduction","Disciplined long-term saving"],
   cons=["Girl child only, opened under age 10","Very long lock-in","₹1.5L/yr cap","Rate can change"]),
 'scss':dict(
   what="A safe government scheme for people aged 60+ that pays steady interest every quarter.",
   works="You invest a lump sum (up to ₹30L) for 5 years (extendable); interest is paid out every quarter.",
   returns="About 8.2%/yr, paid quarterly — high for a guaranteed product.",
   risk="Effectively zero — government-backed.",
   liquidity="Low — 5-year term; premature withdrawal allowed with a penalty.",
   tax="Interest taxed at slab; the deposit qualifies for 80C, and 80TTB gives seniors up to ₹50k interest tax-free.",
   costs="None; penalty if closed early.",
   forwhom="Retirees wanting safe, regular income.",
   pros=["Steady quarterly income","Government-safe","80C deduction","High guaranteed rate"],
   cons=["Age 60+ only","Interest slab-taxed","₹30L cap","5-year lock"]),
 'apy':dict(
   what="A government pension scheme for everyone — pay small amounts now to receive a fixed pension after 60.",
   works="You pick a target pension (₹1,000–₹5,000/month); your monthly contribution is set by your current age. After 60 you receive that pension for life.",
   returns="Not a return product — it's a guaranteed fixed pension; the government makes up any shortfall.",
   risk="Very low — a government-guaranteed pension.",
   liquidity="Very low — designed to run till 60; exit before that is restricted.",
   tax="Contributions can qualify under 80CCD; the pension you receive is taxed as income.",
   costs="None.",
   forwhom="Lower-income or informal-sector workers wanting a guaranteed basic pension.",
   pros=["Guaranteed lifelong pension","Tiny contributions","Government-backed","Spouse continuation"],
   cons=["Small fixed payout","Locked till 60","Pension is taxed","Penalty for missed payments"]),
 'post_office':dict(
   what="Government savings schemes sold at post offices — boringly safe options like NSC, KVP and the Monthly Income Scheme.",
   works="You deposit a lump sum into a scheme (e.g. NSC for 5 years); it earns a government-set rate. POMIS pays monthly income; KVP doubles your money over a set period.",
   returns="About 7.0–7.7%/yr depending on the scheme.",
   risk="Effectively zero — sovereign-backed.",
   liquidity="Low to moderate; most have lock-ins with limited premature exit.",
   tax="Interest taxed at slab; NSC also qualifies for 80C (and its reinvested interest counts toward 80C too).",
   costs="None.",
   forwhom="Conservative savers, especially in smaller towns, who want government safety.",
   pros=["Government-guaranteed","Some qualify for 80C","Widely accessible","Predictable"],
   cons=["Modest, slab-taxed returns","Lock-ins","Paperwork can be manual","Trails equity long term"]),

 # --- BONDS ---
 'gsec':dict(
   what="Loans you make to the Government of India — the safest rupee investment, paying fixed interest.",
   works="You buy a bond with a face value and a coupon (interest) rate; the government pays interest periodically and returns the face value at maturity. Buy via RBI Retail Direct or debt funds.",
   returns="About 7%/yr coupon; longer bonds pay a little more.",
   risk="No default risk (sovereign). But the price moves if you sell before maturity — when interest rates rise, bond prices fall.",
   liquidity="Tradable, but the retail secondary market can be thin; easiest is to hold to maturity.",
   tax="Interest taxed at your slab; capital gains apply if sold before maturity.",
   costs="Negligible via RBI Retail Direct.",
   forwhom="Safety-first investors wanting predictable, government-backed income.",
   pros=["Safest rupee investment","Predictable interest","Many tenures","No default risk"],
   cons=["Slab-taxed interest","Price falls if rates rise","Modest returns","Thin retail market"]),
 'corp_bond':dict(
   what="Loans to a company in return for fixed interest — higher pay than government bonds, with credit risk.",
   works="A company issues bonds or NCDs with a coupon and maturity. You earn interest and get your principal back at maturity, provided the company stays solvent.",
   returns="About 8–9.5%/yr depending on the issuer's rating.",
   risk="Credit risk — a weak company can delay payments or default. Check the rating (AAA safest). The price also moves with interest rates.",
   liquidity="Varies; listed NCDs trade on exchanges but can be illiquid.",
   tax="Interest taxed at slab; capital-gains rules apply if sold.",
   costs="Low; brokerage if traded on an exchange.",
   forwhom="Yield-seekers comfortable assessing a company's credit quality.",
   pros=["Higher yield than G-Secs","Fixed income","Range of ratings and tenures","Listed options exist"],
   cons=["Default/credit risk","Can be illiquid","Slab-taxed","Rate-sensitive price"]),
 'rbi_frsb':dict(
   what="A government savings bond whose interest rate floats — it resets with market rates — locked for 7 years.",
   works="You invest with the RBI; the rate is pegged above the NSC rate and resets every 6 months. Interest is paid half-yearly.",
   returns="About 8%/yr currently, but it changes at every reset.",
   risk="No default risk (government). Your income varies as the rate resets.",
   liquidity="Very low — 7-year lock (some relaxation for seniors); not tradable.",
   tax="Interest taxed at your slab.",
   costs="None.",
   forwhom="Safety-first investors wanting government backing and protection if rates rise.",
   pros=["Government-guaranteed","Benefits if rates rise","Higher than many FDs","Half-yearly income"],
   cons=["7-year lock-in","Income unpredictable (floating)","Slab-taxed","Not tradable"]),
 'tax_free_bonds':dict(
   what="Older bonds from government-backed bodies whose interest is completely tax-free.",
   works="Issued years ago by PSUs (like NHAI, PFC), they pay a fixed coupon with no tax on the interest. No new ones are issued now — you buy them on the exchange.",
   returns="Coupon around 5.5%/yr tax-free — equivalent to roughly 8% pre-tax for a 30%-slab person.",
   risk="Low — government-backed issuers; the price moves with rates if you sell early.",
   liquidity="Listed and tradable, but volumes can be low.",
   tax="Interest is fully tax-free. Capital gains apply if sold before maturity.",
   costs="Brokerage on the exchange.",
   forwhom="High-tax-bracket investors wanting safe, tax-free income.",
   pros=["Tax-free interest","Government-backed issuers","Great for high earners","Long, stable income"],
   cons=["Only on the secondary market now","Low liquidity","Long tenures","Price falls if rates rise"]),
 'tbill_sdl':dict(
   what="Very short-term government IOUs — Treasury Bills and State Development Loans — to park money safely for under a year.",
   works="T-Bills are sold at a discount and redeem at face value (the gap is your return) in 91/182/364 days. Buy via RBI Retail Direct.",
   returns="About 6.5–7%/yr equivalent, depending on tenure.",
   risk="Negligible default risk (sovereign), and very short, so little price risk.",
   liquidity="High for short tenures; easy to hold to maturity.",
   tax="The gain is taxed at your slab.",
   costs="Negligible via RBI Retail Direct.",
   forwhom="Anyone parking money safely for a few months with full government safety.",
   pros=["Government-safe","Very short term","Predictable","Better than idle savings"],
   cons=["Low returns","Slab-taxed","Not for long-term growth","A bit manual to buy"]),

 # --- GOLD ---
 'gold_etf':dict(
   what="Gold you hold digitally in your demat account instead of as jewellery or coins — each unit tracks the gold price.",
   works="You buy and sell units on the exchange like a share; each unit is backed by real gold held by the fund. No locker, no making charges.",
   returns="Tracks gold prices — historically about 8–9%/yr long term, but volatile and earning no income.",
   risk="Price risk — gold can fall or stay flat for years. It pays no income; you only gain from price changes.",
   liquidity="High — trades on the exchange during market hours.",
   tax="Treated as a mixed asset — gains taxed at 12.5% if held long enough, otherwise at your slab (rules evolving).",
   costs="A small expense ratio (~0.5–0.8%) plus brokerage.",
   forwhom="Investors wanting gold for diversification without the storage hassle.",
   pros=["No storage or making charges","Pure gold-price exposure","Liquid","Small ticket size"],
   cons=["Earns no income","Price swings","Needs a demat account","Small annual fee"]),
 'gold_physical':dict(
   what="Real gold you own — coins, bars or jewellery.",
   works="You buy from a jeweller or bank; with jewellery you also pay making charges and usually lose some value when you sell.",
   returns="Tracks gold prices (~8–9%/yr long term), but making charges (10–25% on jewellery) eat into your gain.",
   risk="Price risk plus theft/storage risk and purity concerns.",
   liquidity="Sellable, but jewellery fetches less than its purchase price due to making charges.",
   tax="Mixed asset — gains taxed at 12.5% if held long enough, otherwise at your slab.",
   costs="Making charges (jewellery), locker/storage, and possible purity loss on resale.",
   forwhom="People who value gold for use or tradition rather than as a pure investment.",
   pros=["Tangible and usable (jewellery)","Cultural value","No account needed","Universally accepted"],
   cons=["High making charges","Theft/storage risk","Purity and resale loss","Earns no income"]),
 'sgb':dict(
   what="Government bonds linked to the gold price that also paid 2.5% yearly interest — the best way to own gold, though no new ones are issued now.",
   works="Issued by the RBI, their value tracks gold and they paid 2.5% interest on top. Held to maturity (8 years), the price gain was tax-free.",
   returns="Gold-price growth plus 2.5%/yr interest — better than holding plain gold.",
   risk="Price risk like gold; no default risk (sovereign).",
   liquidity="Listed ones trade on the exchange, but volumes are low; best held to maturity.",
   tax="Interest taxed at slab; the capital gain at maturity was tax-free for the original holder.",
   costs="None to hold.",
   forwhom="Long-term gold investors (now only available via the secondary market).",
   pros=["Gold plus 2.5% interest","Tax-free gain at maturity","Government-backed","No storage needed"],
   cons=["No new issues","Low secondary-market liquidity","8-year tenure","Price swings with gold"]),

 # --- ADVANCED ---
 'debt_mf':dict(
   what="A fund that lends your money out (to governments and companies) for interest — calmer than equity, but not risk-free.",
   works="The fund holds bonds and other debt; its value moves gently with interest rates and the credit quality of what it holds.",
   returns="About 6.5–8%/yr typically, steadier than equity.",
   risk="Lower than equity, but not zero — interest-rate risk, and credit risk if the fund holds weak borrowers.",
   liquidity="Open-ended; redeems in 1–2 working days.",
   tax="Gains are taxed at your slab (the old long-term tax benefit was removed).",
   costs="A small expense ratio (~0.2–1%).",
   forwhom="Investors wanting steadier-than-equity returns or to park money for a few years.",
   pros=["Steadier than equity","Better than idle cash","Easy to redeem","Professionally managed"],
   cons=["Now fully slab-taxed","Credit and rate risk remain","Annual fee","Modest returns"]),
 'crypto':dict(
   what="Digital currencies like Bitcoin — extremely volatile, lightly regulated as an asset, and heavily taxed in India.",
   works="You buy and sell coins on exchanges; prices swing wildly on demand, sentiment and global events. There's no underlying cash flow behind them.",
   returns="No fundamental return — it's pure price speculation. It can multiply or crash; treat anything you put in as at-risk.",
   risk="Very high — huge swings, hacks and scams, no investor protection, and prices can fall to near-zero.",
   liquidity="Generally high on major exchanges, but can freeze in times of stress.",
   tax="A flat 30% on every gain with no expense deductions, plus 1% TDS on sales; losses can't offset other income or even other crypto gains.",
   costs="Exchange fees, spreads, and 1% TDS.",
   forwhom="Only money you can fully afford to lose, as a tiny speculative slice of a portfolio.",
   pros=["Very high upside potential","Easy to start","Trades 24/7","Tiny amounts possible"],
   cons=["Can crash to near-zero","Flat 30% tax, no loss offset","Scam and hack risk","No investor protection"]),
 'foreign':dict(
   what="Buying shares of overseas companies (like Apple or Google) directly from India.",
   works="Through brokers that allow US investing under the RBI's remittance scheme; your returns depend on the stock AND the rupee–dollar exchange rate.",
   returns="The stock's return plus currency moves — a weakening rupee adds to gains; a strengthening rupee subtracts.",
   risk="Market risk + currency risk + the company's own risk; concentrated if you pick single stocks.",
   liquidity="High during US market hours.",
   tax="Treated as a foreign/mixed asset — long-term gains taxed at 12.5% (no ₹1.25L exemption); dividends also face US withholding tax.",
   costs="Brokerage, forex-conversion charges, and possible platform fees.",
   forwhom="Investors wanting global diversification who understand currency risk.",
   pros=["Own global giants","Currency diversification","Access to big tech","Diversifies beyond India"],
   cons=["Currency risk","No ₹1.25L exemption","Conversion and brokerage costs","US-hours trading"]),
 'intl_mf':dict(
   what="Indian mutual funds that invest abroad for you — global exposure without the paperwork of investing directly.",
   works="You buy units in rupees; the fund invests in global markets (often via a feeder into an overseas fund). Its value moves with foreign markets and the rupee.",
   returns="Tracks the underlying global market, about 10–13%/yr historically, plus or minus currency moves.",
   risk="Market plus currency risk; some funds have had inflow caps due to regulatory limits.",
   liquidity="Open-ended; redeems in a few working days.",
   tax="Taxed as a mixed/non-equity asset; long-term gains generally at 12.5% (check the specific fund's structure).",
   costs="An expense ratio (~0.5–1.5%), sometimes higher for feeder funds.",
   forwhom="Investors wanting easy global diversification from an Indian platform.",
   pros=["Global exposure, no paperwork","Buy in rupees","Diversifies beyond India","SIP-friendly"],
   cons=["Currency risk","Higher fees (feeders)","Possible inflow caps","Complex taxation"]),
 'ulip':dict(
   what="ULIP = Unit-Linked Insurance Plan: one policy that bundles life insurance WITH investing. Part of your premium pays for life cover; the rest is invested in equity/debt funds you pick, so its value moves with the market.",
   works="You pay a yearly premium. Several charges come off first (see Costs); whatever's left is invested in funds you choose, and you can switch funds later. It's locked for 5 years. If you die, your family gets the cover; otherwise you get the fund value at the end.",
   returns="Market-linked (like a mutual fund), but the front-loaded charges usually make it trail a plain index fund — so a term plan + index fund often beats it.",
   risk="Market risk on the investment part; the bigger issue is complexity and opaque charges.",
   liquidity="Low — a 5-year lock-in.",
   tax="80C on premiums; maturity is tax-free only if the annual premium stays within prescribed limits (₹2.5L).",
   costs="Several charges — premium allocation, policy admin, fund management, mortality — that eat into early returns.",
   forwhom="Rarely the best choice — usually better to buy term insurance and invest separately.",
   pros=["Insurance + investment in one","80C deduction","Tax-free maturity (within limits)","Fund-switching allowed"],
   cons=["High, layered charges","5-year lock-in","Usually trails a simple fund","Hard to compare costs"]),
 'endowment':dict(
   what="A traditional life-insurance policy (the classic LIC-style plan) that doubles as savings. It pays your family a sum if you die during the term, and pays you a guaranteed maturity amount if you survive — a 'money-back' version returns bits along the way.",
   works="You pay a fixed premium for many years. The insurer guarantees a modest return (often via a 'sum assured + bonuses'). It's safe and predictable, but you can't pick where it's invested and you can't easily exit early without losing value.",
   returns="Low and guaranteed-ish — usually about 4–6%/yr, well below equity. The cost of bundling insurance with savings.",
   risk="Very low investment risk (guaranteed-style). The real 'risk' is opportunity cost — your money grows far slower than it could.",
   liquidity="Very low — long term (15–25 years); surrendering early usually means a loss.",
   tax="Premiums qualify for 80C; maturity is tax-free under 10(10D) if premiums stay within prescribed limits.",
   costs="Built-in commissions and charges keep returns low; surrender penalties if you quit early.",
   forwhom="People who value guaranteed safety + life cover in one and won't touch the money for decades. For most, term insurance + an index fund is better value.",
   pros=["Guaranteed, very safe","Life cover included","80C + tax-free maturity","Forces long-term saving"],
   cons=["Low returns (4–6%)","Very long lock-in","Insurance + investing mixed (poor value)","Costly to exit early"]),
 'real_estate':dict(
   what="Buying physical property — a flat, house or land — to earn rent and hopefully sell higher later.",
   works="You buy property (often with a home loan), earn rent, and aim for price appreciation. It's big-ticket and slow to transact.",
   returns="Long-term roughly 7–10%/yr in many markets, plus a rental yield (~2–4%) — but highly location-dependent.",
   risk="Illiquidity, heavy concentration in one asset, plus maintenance, tenant and legal risks; prices can stagnate for years.",
   liquidity="Very low — selling takes weeks to months and carries large transaction costs.",
   tax="Rent taxed at slab (with some deductions); long-term capital gains are taxed, with indexation/exemption rules for property.",
   costs="Huge upfront — stamp duty + registration (often 5–8%), brokerage, maintenance and property tax.",
   forwhom="Investors with large capital and a long horizon who want a tangible asset and rental income.",
   pros=["Tangible asset + rental income","Long-term appreciation","Loan leverage possible","Home-loan tax breaks"],
   cons=["Huge upfront costs","Very illiquid","Concentrated, location risk","Maintenance and legal hassle"]),
}

# Tap-to-define glossary (English, ~12-yo plain). First occurrence of each term in a
# lesson/card gets a dotted underline; tapping reveals the definition inline.
GLOSS = {
 "NPS":"National Pension System — a government retirement account you pay into while working and draw from after 60",
 "EPF":"Employees' Provident Fund — retirement savings cut from your salary each month, matched by your employer",
 "NAV":"the price of one unit of a mutual fund, updated once a day",
 "demat account":"an online locker that holds your shares and fund units — like a bank account for investments",
 "demat":"an online locker that holds your shares and fund units",
 "expense ratio":"the yearly fee a fund charges, taken as a small % of your money",
 "LTCG":"long-term capital gains — profit on something you held a long time before selling",
 "STCG":"short-term capital gains — profit on something you sold soon after buying",
 "STT":"a small government tax on each stock trade",
 "dividends":"a share of a company's profit, paid out to people who own its shares",
 "dividend":"a share of a company's profit, paid out to people who own its shares",
 "distributions":"money a REIT or fund pays out to investors, like rent or interest",
 "distribution":"money a REIT or fund pays out to investors, like rent or interest",
 "yield":"the yearly income from an investment, shown as a % of its price",
 "rebalances":"adjusts the mix back to target — e.g. sells some stocks to buy bonds",
 "rebalance":"adjust the mix back to target — e.g. sell some stocks to buy bonds",
 "corpus":"the total pot of money you've built up",
 "SIP":"investing a fixed amount every month, automatically",
 "SWP":"withdrawing a fixed amount every month from your investments",
 "lump sum":"a single one-time amount, instead of monthly bits",
 "units":"the 'shares' of a mutual fund that you own",
 "large-cap":"a very big, well-established company",
 "small-cap":"a smaller, younger company — riskier but can grow faster",
 "ETFs":"funds that trade on the stock exchange like a single share",
 "ETF":"a fund that trades on the stock exchange like a single share",
 "brokerage":"the fee a broker charges to buy or sell for you",
 "GST":"a government tax added on fees and services",
 "forex":"foreign currency — money from another country",
 "EMI":"equated monthly instalment — paying something off in equal monthly amounts",
 "APR":"annual percentage rate — the interest rate charged per year",
 "grace period":"the interest-free days you get to pay your card bill in full",
 "credit score":"a number (300–900) lenders use to judge how reliably you repay",
 "utilisation":"how much of your card limit you're currently using",
 "CIBIL":"India's main credit score, from 300 to 900",
 "NBFC":"a finance company that lends like a bank but isn't one",
 "ULIP":"a policy that mixes life insurance with market-linked investing",
 "endowment":"a traditional life-insurance policy that also pays a guaranteed lump sum if you survive the term",
 "term insurance":"pure life cover — pays your family if you die, with no investment or return",
 "money-back":"an insurance plan that returns part of your money at intervals, not just at the end",
 "10(10D)":"the rule that makes life-insurance maturity tax-free, within premium limits",
 "TDS":"tax deducted at source — a slice of tax cut before you even get the money",
 "EEE":"exempt-exempt-exempt — no tax going in, while growing, or coming out",
 "annuity":"a plan that pays you a fixed amount regularly, usually for life",
 "coupon":"the fixed interest a bond pays you",
 "indexation":"adjusting your purchase price for inflation so you're taxed on less gain",
 "feeder fund":"an Indian fund that simply invests into one bigger overseas fund",
 "DICGC":"the body that insures bank deposits up to ₹5 lakh",
 "surcharge":"an extra tax on top of your tax, for very high incomes",
 "cess":"a small extra charge (4%) added on your tax, for health & education",
 "standard deduction":"a flat amount cut from your salary before tax, no proof needed",
 "rebate":"a reduction that can bring your tax down to zero up to a limit (Section 87A)",
 "80C":"a rule letting you cut up to ₹1.5L from taxable income via certain investments",
 "80D":"a deduction for health-insurance premiums you pay",
 "80TTA":"a deduction for interest earned in a savings account",
 "80CCD(1B)":"an extra ₹50,000 deduction for putting money into NPS",
 "NSC":"National Savings Certificate — a fixed-term government savings scheme",
 "KVP":"Kisan Vikas Patra — a government scheme that doubles your money over a set period",
 "remittance":"sending money abroad — capped yearly under RBI rules",
}

# Food analogies — explain each product to a kid with everyday Indian food
FOOD = {
 'stocks':"buying ONE samosa from a single shop. If that shop becomes famous, yours is worth a lot — if it goes bad, you're stuck with it.",
 'equity_mf':"a thali — someone fills your plate with many dishes (lots of companies). If one dish is bad, the others still fill you up.",
 'index':"a buffet that automatically serves a little of EVERY popular dish in town. Cheap, and you never miss the famous ones.",
 'elss':"a tiffin you can't open for 3 years — but you get a bonus treat for waiting (a tax saving).",
 'hybrid':"curd-rice — spicy stocks mixed with cooling bonds. Less exciting, but it rarely upsets your tummy.",
 'reit':"owning a tiny share of a big restaurant — you get a little of the rent money every few months.",
 'fd':"putting ladoos in a locked steel dabba. Totally safe, and it magically adds one extra ladoo by the time you open it — slowly.",
 'rd':"adding one ladoo to the dabba every single month, so it's nicely full by year-end.",
 'savings':"a sweet box on the table — easy to grab anytime, but it barely refills on its own.",
 'corp_fd':"keeping your ladoos in a neighbour's dabba instead of the bank's — they promise MORE ladoos back, but what if they eat some?",
 'ppf':"a giant mithai jar the government locks for 15 years — it fills up slowly and nobody takes a single piece (no tax).",
 'epf':"a tiffin your office fills from your pocket money AND adds extra to — opened mostly when you're all grown up.",
 'nps':"saving snacks until you're old (60). Most you eat free; a little turns into a fixed daily snack (pension) for life.",
 'ssy':"a special sweet jar just for a daughter — locked till she's grown, and untouched by tax.",
 'scss':"a jar for grandparents (60+) that hands out a fixed plate of snacks every few months.",
 'apy':"paying a little tiffin money now so you're promised a small guaranteed snack every day when you're old.",
 'post_office':"the corner shop's super-safe sweet scheme — boring and slow, but it never cheats you.",
 'gsec':"lending your tiffin to the headmaster — the safest person in school — who returns it with one extra biscuit.",
 'corp_bond':"lending your tiffin to a classmate who promises two extra biscuits — more biscuits, but will they return it?",
 'rbi_frsb':"the headmaster's biscuit deal where the number of biscuits changes over time — and you can't ask for it back for 7 years.",
 'tax_free_bonds':"a biscuit deal where you keep EVERY biscuit (no tax bite) — but these old deals are only sold second-hand now.",
 'tbill_sdl':"lending lunch money to the headmaster for just a few months — a little extra back, quickly and very safely.",
 'gold_etf':"keeping your gold sweets in a phone app instead of a box — no locker, no melting, same gold.",
 'gold_physical':"real gold jewellery — pretty to wear, but the jeweller keeps a chunk as a 'making' charge.",
 'sgb':"government gold sweets that ALSO drop a few extra sweets each year while you hold them.",
 'debt_mf':"a tiffin-lending club run by an expert — calmer than the stock thali, steady small biscuits.",
 'crypto':"a mystery candy that could become 10 sweets… or vanish completely. Super exciting, super risky — and a big bite (30%) is taken from any winnings.",
 'foreign':"buying a famous foreign chocolate (like a US brand) — yummy, but its price also wobbles with the dollar.",
 'intl_mf':"an Indian shopkeeper who buys foreign chocolates for you — global taste, no need to travel abroad.",
 'ulip':"a combo meal of insurance + investment — looks like value, but lots of hidden charges nibble at it.",
 'endowment':"a tiffin that also promises a small fixed snack later — totally safe, but that snack is tiny next to what the same money could grow into.",
 'real_estate':"buying a whole sweet shop — it earns rent and may sell higher later, but it costs a LOT and is slow to sell.",
}

def jdump(s): return json.dumps(s, ensure_ascii=False)

# ----- generate JS pieces -----
def b(v): return 'true' if v else 'false'
prod_js = "[\n"+",\n".join(
  "  {id:'%s',icon:'%s',cat:'%s',bucket:'%s',anim:'%s',spread:%s,charge:%s,early:%s,is80c:%s}"
  % (p['id'],p['icon'],p['cat'],p['bucket'],p['anim'],p['spread'],p['charge'],
     ("'"+p['early']+"'") if p['early'] else 'null', b(p['is80c']))
  for p in P)+"\n]"

# default expected returns map (ret default per product)
RET = {'stocks':13,'equity_mf':12,'index':11.5,'elss':13,'hybrid':10,'reit':9,
 'fd':6.8,'rd':6.5,'savings':3,'corp_fd':8,'ppf':7.1,'epf':8.25,'nps':10,'ssy':8.2,
 'scss':8.2,'apy':8,'post_office':7.5,'gsec':7,'corp_bond':8.5,'rbi_frsb':8.05,
 'tax_free_bonds':5.5,'tbill_sdl':6.8,'gold_etf':9,'gold_physical':9,'sgb':9,
 'debt_mf':7.5,'crypto':18,'foreign':13,'intl_mf':12,'ulip':8,'endowment':5,'real_estate':7}

ps_js = "{\n"+",\n".join(
  "  %s:{active:%s,pct:%s,years:%s,ret:%s,broke:false}"
  % (p['id'], b(p['id'] in DEFAULT_ACTIVE), DEFAULT_ACTIVE.get(p['id'],0), p['years'], RET[p['id']])
  for p in P)+"\n}"

def obj(field, lang):
    idx = {'name':0,'eli5':1,'ex':2}[field]
    return "{"+",".join("%s:%s"%(p['id'], jdump(p[lang][idx])) for p in P)+"}"

names_en, eli5_en, ex_en = obj('name','en'), obj('eli5','en'), obj('ex','en')
names_hi, eli5_hi, ex_hi = obj('name','hi'), obj('eli5','hi'), obj('ex','hi')
cats_en = "["+",".join("{k:'%s',l:%s}"%(c[0],jdump(c[1])) for c in CATS)+"]"
cats_hi = "["+",".join("{k:'%s',l:%s}"%(c[0],jdump(c[2])) for c in CATS)+"]"
behav_en = "{"+",".join("%s:%s"%(k,jdump(v[0])) for k,v in BEHAV.items())+"}"
behav_hi = "{"+",".join("%s:%s"%(k,jdump(v[1])) for k,v in BEHAV.items())+"}"
tips_en = "{"+",".join("%s:%s"%(p['id'],jdump(TIP[p['id']])) for p in P)+"}"
lessons_en = jdump(LESSON)
gloss_en = jdump(GLOSS)
food_en = jdump(FOOD)

# ----- embed fonts (base64 woff2) so the app is fully offline / no Google dependency -----
def _font_b64(fn):
    with open(os.path.join(BASE,'assets',fn),'rb') as f:
        return base64.b64encode(f.read()).decode('ascii')
_LATIN='U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'
fonts_css = (
  "@font-face{font-family:'Space Grotesk';font-style:normal;font-weight:300 700;font-display:swap;"
  "src:url(data:font/woff2;base64,%s) format('woff2');unicode-range:%s}"
  "@font-face{font-family:'Outfit';font-style:normal;font-weight:300 700;font-display:swap;"
  "src:url(data:font/woff2;base64,%s) format('woff2');unicode-range:%s}"
) % (_font_b64('spacegrotesk-latin.woff2'), _LATIN, _font_b64('outfit-latin.woff2'), _LATIN)

# ----- read template, inject -----
tpl = open(os.path.join(BASE,'template.html'),'r',encoding='utf-8').read()
out = (tpl
  .replace('/*FONTS_CSS*/', fonts_css)
  .replace('/*PRODUCTS*/', prod_js)
  .replace('/*PS*/', ps_js)
  .replace('/*NAMES_EN*/', names_en).replace('/*ELI5_EN*/', eli5_en).replace('/*EX_EN*/', ex_en)
  .replace('/*NAMES_HI*/', names_hi).replace('/*ELI5_HI*/', eli5_hi).replace('/*EX_HI*/', ex_hi)
  .replace('/*CATS_EN*/', cats_en).replace('/*CATS_HI*/', cats_hi)
  .replace('/*BEHAV_EN*/', behav_en).replace('/*BEHAV_HI*/', behav_hi)
  .replace('/*TIPS_EN*/', tips_en)
  .replace('/*LESSONS_EN*/', lessons_en)
  .replace('/*GLOSS_EN*/', gloss_en)
  .replace('/*FOOD_EN*/', food_en))
out_path = os.path.join(BASE,'learn-money.html')
open(out_path,'w',encoding='utf-8').write(out)
open(os.path.join(BASE,'index.html'),'w',encoding='utf-8').write(out)   # GitHub Pages entry (root URL)
print("products:", len(P))
print("written", out_path, "+ index.html")
