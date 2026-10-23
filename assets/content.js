/* Bhoomi Saral — content: UI strings, plain-language rules, glossary and official-site guide.
   Everything here is static text; no personal data. */
let LANG='en';
const T={
 tabFind:{en:'Find land',hi:'ज़मीन खोजें'},tabEx:{en:'Explain',hi:'समझें'},tabMine:{en:'My land',hi:'मेरी ज़मीन'},tabWords:{en:'Words',hi:'शब्द'},tabGuide:{en:'Check officially',hi:'आधिकारिक जाँच'},
 findTitle:{en:'Tap your village. Tap your plot.',hi:'अपना गाँव चुनें। अपना खेत चुनें।'},
 findSub:{en:'Pick a district and village, then tap any plot on the map to see what its record means in plain words.',hi:'जनपद और गाँव चुनें, फिर नक्शे पर किसी भी खेत को छुएँ — उसका रिकॉर्ड आसान भाषा में समझें।'},
 district:{en:'District · जनपद',hi:'जनपद · District'},tehsil:{en:'Tehsil · तहसील',hi:'तहसील · Tehsil'},village:{en:'Village · ग्राम',hi:'ग्राम · Village'},
 plot:{en:'Plot (Khasra / Gata no.) · खसरा / गाटा संख्या',hi:'खसरा / गाटा संख्या · Plot no.'},go:{en:'Show',hi:'दिखाएँ'},
 legend:{en:'Map colours',hi:'नक्शे के रंग'},lgOk:{en:'Looks clear',hi:'साफ़ दिखता है'},lgWarn:{en:'Check first',hi:'पहले जाँचें'},lgBad:{en:'High risk',hi:'ज़्यादा जोखिम'},lgPub:{en:'Public land',hi:'सार्वजनिक भूमि'},
 demoT:{en:'Demo data:',hi:'डेमो डेटा:'},demoB:{en:'villages, plot shapes, names and entries here are fictional and generated in your browser. They show how the experience works. For your real record, use the "Check officially" tab.',hi:'यहाँ के गाँव, खेतों के आकार, नाम और प्रविष्टियाँ काल्पनिक हैं और आपके ब्राउज़र में बनाई गई हैं। असली रिकॉर्ड के लिए "आधिकारिक जाँच" टैब देखें।'},
 exTitle:{en:'Explain my khatauni',hi:'मेरी खतौनी समझाएँ'},exSub:{en:'Copy a few details from your own khatauni (from upbhulekh.gov.in). Nothing leaves this computer.',hi:'अपनी खतौनी (upbhulekh.gov.in से) की कुछ जानकारी भरें। कुछ भी इस कंप्यूटर से बाहर नहीं जाता।'},
 fKhasra:{en:'Khasra / Gata no.',hi:'खसरा / गाटा संख्या'},fKhata:{en:'Khata no.',hi:'खाता संख्या'},fArea:{en:'Area (hectare)',hi:'रकबा (हेक्टेयर)'},fOwners:{en:'No. of co-holders',hi:'सह-खातेदारों की संख्या'},
 fClass:{en:'Holder class (श्रेणी) shown in khatauni',hi:'खतौनी में दर्ज श्रेणी'},fSeen:{en:'Do you see any of these in the remarks (टिप्पणी / आदेश) column?',hi:'क्या टिप्पणी / आदेश कॉलम में इनमें से कुछ लिखा है?'},
 cLoan:{en:'Loan / mortgage entry (बंधक, कृषि ऋण, बैंक का नाम)',hi:'बंधक / कृषि ऋण / बैंक का नाम'},cCourt:{en:'Court case mentioned (वाद, मुकदमा, स्थगन)',hi:'वाद / मुकदमा / स्थगन आदेश'},
 cMut:{en:'Name transfer pending (नामांतरण / दाखिल-ख़ारिज लंबित)',hi:'नामांतरण / दाखिल-ख़ारिज लंबित'},cVar:{en:'A holder has died but heirs not recorded (वरासत)',hi:'खातेदार की मृत्यु, वरासत दर्ज नहीं'},cNA:{en:'Declared non-agricultural (धारा 80 / अकृषिक)',hi:'धारा 80 के अंतर्गत अकृषिक घोषित'},
 exGo:{en:'Explain in plain words',hi:'आसान भाषा में समझाएँ'},exSave:{en:'Save to My land',hi:'मेरी ज़मीन में सहेजें'},
 privT:{en:'Private by design:',hi:'पूरी तरह निजी:'},privB:{en:'everything you type stays in this browser. Saved plots live only on this device.',hi:'आप जो भी भरते हैं वह इसी ब्राउज़र में रहता है। सहेजे गए खेत केवल इसी डिवाइस पर रहते हैं।'},
 mineTitle:{en:'My land',hi:'मेरी ज़मीन'},mineSub:{en:'Plots you saved from "Explain my khatauni". Stored only on this device.',hi:'"मेरी खतौनी समझाएँ" से सहेजे गए खेत। केवल इसी डिवाइस पर।'},
 remT:{en:'Re-check reminder',hi:'दोबारा जाँचने की याद'},remB:{en:"Open upbhulekh.gov.in every few months and compare your khatauni with what you saved. A new name, loan or case entry you didn't expect is a warning sign.",hi:'हर कुछ महीनों में upbhulekh.gov.in पर अपनी खतौनी देखें और सहेजी जानकारी से मिलाएँ। कोई अनजाना नया नाम, ऋण या वाद दर्ज हो तो सावधान हो जाएँ।'},
 wTitle:{en:'Land words, made simple',hi:'ज़मीन के शब्द, आसान भाषा में'},wSub:{en:"The terms you'll meet in UP land records.",hi:'यूपी भू-अभिलेखों में मिलने वाले शब्द।'},
 gTitle:{en:'See your real record — free',hi:'अपना असली रिकॉर्ड देखें — मुफ़्त'},gSub:{en:'All of these are official UP government websites. Viewing is free. You fill the captcha yourself.',hi:'ये सभी उत्तर प्रदेश सरकार की आधिकारिक वेबसाइटें हैं। देखना मुफ़्त है। कैप्चा आप स्वयं भरें।'},
 // sheet
 khasra:{en:'Khasra',hi:'खसरा'},area:{en:'Area',hi:'रकबा'},acre:{en:'acre',hi:'एकड़'},hect:{en:'hectare',hi:'हेक्टेयर'},sqm:{en:'sq m',hi:'वर्ग मी.'},
 recIn:{en:'Recorded in khatauni',hi:'खतौनी में दर्ज'},khataNo:{en:'Khata no.',hi:'खाता संख्या'},fasli:{en:'Fasli year',hi:'फसली वर्ष'},klass:{en:'Holder class',hi:'श्रेणी'},landUse:{en:'Land type',hi:'भूमि का प्रकार'},
 holders:{en:'Who is recorded',hi:'किसका नाम दर्ज है'},show:{en:'Show names',hi:'नाम दिखाएँ'},hide:{en:'Hide names',hi:'नाम छिपाएँ'},
 whatMeans:{en:'What this means for you',hi:'आपके लिए इसका मतलब'},notProveT:{en:'What this record does NOT prove',hi:'यह रिकॉर्ड क्या साबित नहीं करता'},
 nextT:{en:'Check the real record',hi:'असली रिकॉर्ड जाँचें'},canSell:{en:'Can it be sold?',hi:'क्या बेची जा सकती है?'},
 bigha:{en:'≈ pakka bigha*',hi:'≈ पक्का बीघा*'},
 v_ok:{en:'Looks straightforward',hi:'रिकॉर्ड साफ़ दिखता है'},v_okB:{en:'No warning entries in what you entered. Still verify before any deal.',hi:'आपके भरे विवरण में कोई चेतावनी नहीं। फिर भी सौदे से पहले जाँच ज़रूर करें।'},
 v_warn:{en:'Check before any deal',hi:'सौदे से पहले जाँच ज़रूरी'},v_warnB:{en:'Some entries need attention. Read the points below.',hi:'कुछ प्रविष्टियों पर ध्यान देना ज़रूरी है। नीचे पढ़ें।'},
 v_bad:{en:'High risk',hi:'ज़्यादा जोखिम'},v_badB:{en:'Serious issues are recorded. Do not buy or pay advance until resolved.',hi:'गंभीर बातें दर्ज हैं। सुलझने तक न ख़रीदें, न बयाना दें।'},
 v_pub:{en:'Public land — not for sale',hi:'सार्वजनिक भूमि — बिक्री योग्य नहीं'},v_pubB:{en:'This is Gram Sabha / public land.',hi:'यह ग्राम सभा / सार्वजनिक भूमि है।'},
 todo:{en:'What to do:',hi:'क्या करें:'},demoSrc:{en:'Source: fictional demo data generated in your browser — not a real record. A revenue record is not proof of ownership.',hi:'स्रोत: आपके ब्राउज़र में बना काल्पनिक डेमो डेटा — असली रिकॉर्ड नहीं। राजस्व अभिलेख स्वामित्व का प्रमाण नहीं है।'},
 userSrc:{en:'Source: details you typed from your own khatauni. Stored only on this device. A revenue record is not proof of ownership.',hi:'स्रोत: आपकी अपनी खतौनी से भरी जानकारी। केवल इसी डिवाइस पर। राजस्व अभिलेख स्वामित्व का प्रमाण नहीं है।'},
 saved:{en:'Saved to My land ✓',hi:'मेरी ज़मीन में सहेजा गया ✓'},none:{en:'Nothing saved yet. Use "Explain my khatauni" and press Save.',hi:'अभी कुछ सहेजा नहीं गया। "मेरी खतौनी समझाएँ" से सहेजें।'},
 open:{en:'Open',hi:'खोलें'},del:{en:'Remove',hi:'हटाएँ'},notFound:{en:'No plot with that number in this demo village.',hi:'इस डेमो गाँव में यह खसरा नहीं मिला।'},
 yourPlot:{en:'Your plot',hi:'आपका खेत'},
 unnamed:{en:'Unnamed area',hi:'बिना नाम का क्षेत्र'},
 unnamedNote:{en:'The open map data has no village name for this outline. It may be forest, river, town land, or a village whose details are missing. Open UP Bhu-Naksha, find this spot on its map and read the village name there — then look it up on UP Bhulekh.',hi:'ओपन नक्शा डेटा में इस सीमा का गाँव का नाम नहीं है। यह वन, नदी, शहरी भूमि या ऐसा गाँव हो सकता है जिसका विवरण छूट गया है। UP भू-नक्शा खोलें, उसके नक्शे पर यही जगह ढूँढें और वहाँ गाँव का नाम पढ़ें — फिर UP भूलेख पर खोजें।'}
};
Object.assign(T, {
  searchPh:{en:'Search a village…',hi:'गाँव खोजें…'},
  attrib:{en:'Boundaries: Census 2011 / LGD village outlines via the open INDIAN-SHAPEFILES dataset (MIT). Approximate — not legal boundaries.',hi:'सीमाएँ: जनगणना 2011 / LGD ग्राम सीमाएँ (ओपन INDIAN-SHAPEFILES डेटा, MIT)। अनुमानित — क़ानूनी सीमा नहीं।'},
  fNote:{en:'Your note (optional)',hi:'आपका नोट (वैकल्पिक)'},notePh:{en:"e.g. Dada ji's field near the canal",hi:'जैसे नहर के पास दादा जी का खेत'},
  exDraw:{en:'Draw this plot on the map',hi:'नक्शे पर खेत बनाएँ'},exSample:{en:'See an example card',hi:'उदाहरण कार्ड देखें'},
  mineSub2:{en:'Your saved plots. Stored only in this browser on this device.',hi:'आपके सहेजे गए खेत। केवल इसी डिवाइस के ब्राउज़र में।'},
  moveT:{en:'Use on another device',hi:'दूसरे डिवाइस पर उपयोग'},moveB:{en:'Your data never goes to any server. To move it, export a file here and import it on your other device.',hi:'आपका डेटा किसी सर्वर पर नहीं जाता। दूसरे डिवाइस पर ले जाने के लिए यहाँ फ़ाइल निर्यात करें और वहाँ आयात करें।'},
  exp:{en:'Export my data',hi:'डेटा निर्यात करें'},imp:{en:'Import file',hi:'फ़ाइल आयात करें'},
  gPh:{en:'Search… e.g. khatauni, वरासत',hi:'खोजें… जैसे खतौनी, वरासत'},
  whereAmI:{en:'Which village am I in?',hi:'मैं किस गाँव में हूँ?'},allUP:{en:'All UP',hi:'पूरा यूपी'},
  dGps:{en:'Add my GPS position',hi:'मेरी GPS स्थिति जोड़ें'},dUndo:{en:'Undo',hi:'वापस'},dDone:{en:'Finish',hi:'पूरा करें'},dCancel:{en:'Cancel',hi:'रद्द करें'},
  districts:{en:'districts',hi:'जनपद'},tehsils:{en:'tehsils',hi:'तहसीलें'},villages:{en:'villages',hi:'गाँव'},
  allDistricts:{en:'Uttar Pradesh',hi:'उत्तर प्रदेश'},filterPh:{en:'Type to filter…',hi:'छाँटने के लिए लिखें…'},
  pickDistrict:{en:'Choose your district',hi:'अपना जनपद चुनें'},pickTehsil:{en:'Choose tehsil',hi:'तहसील चुनें'},pickVillage:{en:'Choose village',hi:'गाँव चुनें'},
  village:{en:'Village',hi:'ग्राम'},tehsil:{en:'Tehsil',hi:'तहसील'},district:{en:'District',hi:'जनपद'},
  gp:{en:'Gram panchayat',hi:'ग्राम पंचायत'},block:{en:'Block',hi:'विकास खंड'},lgdCode:{en:'LGD village code',hi:'LGD ग्राम कोड'},c11:{en:'Census 2011 code',hi:'जनगणना 2011 कोड'},
  vArea:{en:'Village area (approx.)',hi:'गाँव का क्षेत्रफल (लगभग)'},
  seeRecords:{en:'See this village\'s real records — free',hi:'इस गाँव के असली रिकॉर्ड देखें — मुफ़्त'},
  stepBhulekh:{en:'On UP Bhulekh choose: district <b>{d}</b> → tehsil <b>{t}</b> → village <b>{v}</b>, then search your khasra or khata.',hi:'UP भूलेख पर चुनें: जनपद <b>{d}</b> → तहसील <b>{t}</b> → ग्राम <b>{v}</b>, फिर अपना खसरा या खाता खोजें।'},
  stepNaksha:{en:'On UP Bhu-Naksha pick the same village and click your plot to see its shape.',hi:'UP भू-नक्शा पर यही गाँव चुनें और अपने खेत पर क्लिक करें।'},
  stepExplain:{en:'Come back and enter what you see in "Explain" — or draw your plot here.',hi:'वापस आकर जो दिखे उसे "समझें" में भरें — या यहाँ अपना खेत बनाएँ।'},
  tehsilNote:{en:'Tehsil names follow Census 2011. Some tehsils were created later — if the name differs on Bhulekh, pick the current tehsil.',hi:'तहसील के नाम जनगणना 2011 के अनुसार हैं। कुछ तहसीलें बाद में बनीं — भूलेख पर नाम अलग हो तो वर्तमान तहसील चुनें।'},
  addPlot:{en:'Add my plot in this village',hi:'इस गाँव में मेरा खेत जोड़ें'},copy:{en:'Copy',hi:'कॉपी'},copied:{en:'Copied',hi:'कॉपी हो गया'},
  approx:{en:'Village outline is approximate (Census 2011 / LGD) — not a legal boundary.',hi:'गाँव की सीमा अनुमानित है (जनगणना 2011 / LGD) — क़ानूनी सीमा नहीं।'},
  myHere:{en:'My plots in this village',hi:'इस गाँव में मेरे खेत'},
  drawHelp:{en:'Tap each corner of your field on the map — or stand at each corner and press <b>Add my GPS position</b>.',hi:'नक्शे पर अपने खेत के हर कोने पर टैप करें — या हर कोने पर खड़े होकर <b>मेरी GPS स्थिति जोड़ें</b> दबाएँ।'},
  points:{en:'Corners',hi:'कोने'},mapArea:{en:'Area on map',hi:'नक्शे पर क्षेत्रफल'},needs3:{en:'Add at least 3 corners.',hi:'कम से कम 3 कोने जोड़ें।'},
  gpsFail:{en:'Could not get your location. Allow location access and try again.',hi:'आपकी लोकेशन नहीं मिली। लोकेशन की अनुमति दें और फिर कोशिश करें।'},
  gpsAcc:{en:'GPS point added (±{m} m).',hi:'GPS बिंदु जोड़ा गया (±{m} मी.)।'},
  notInUP:{en:'Your location seems to be outside Uttar Pradesh.',hi:'आपकी लोकेशन उत्तर प्रदेश के बाहर लगती है।'},locating:{en:'Finding your location…',hi:'लोकेशन खोजी जा रही है…'},
  shapeSet:{en:'Plot shape drawn: {a} ha on the map.',hi:'खेत का आकार बना: नक्शे पर {a} हेक्टेयर।'},
  inVillage:{en:'Village: <b>{v}</b>, {t}, {d}',hi:'ग्राम: <b>{v}</b>, {t}, {d}'},
  exported:{en:'Exported. Keep this file private.',hi:'निर्यात हो गया। यह फ़ाइल निजी रखें।'},imported:{en:'Imported {n} plots.',hi:'{n} खेत आयात हुए।'},badFile:{en:'That file is not a Bhoomi Saral export.',hi:'यह Bhoomi Saral की फ़ाइल नहीं है।'},
  deleted:{en:'Removed.',hi:'हटा दिया।'},savedT:{en:'Saved to My land ✓',hi:'मेरी ज़मीन में सहेजा गया ✓'},
  noMatch:{en:'No village found.',hi:'कोई गाँव नहीं मिला।'},searching:{en:'Loading village list…',hi:'गाँवों की सूची लोड हो रही है…'},
  mapShape:{en:'Shape drawn on map',hi:'नक्शे पर बना आकार'},recArea:{en:'Area in record',hi:'रिकॉर्ड में रकबा'},
  greetM:{en:'Good morning',hi:'सुप्रभात'},greetA:{en:'Good afternoon',hi:'नमस्कार'},greetE:{en:'Good evening',hi:'शुभ संध्या'},
  heroT:{en:'Find any land in Uttar Pradesh',hi:'उत्तर प्रदेश की कोई भी ज़मीन खोजें'},
  heroB:{en:'Every district, tehsil and village on one map — and your land record explained in plain words.',hi:'हर जनपद, तहसील और गाँव एक नक्शे पर — और आपका भूमि रिकॉर्ड आसान भाषा में।'},
  qLocateB:{en:'Use your phone\'s GPS',hi:'अपने फ़ोन का GPS इस्तेमाल करें'},
  qExplainB:{en:'Plain-language risk check',hi:'आसान भाषा में जोखिम जाँच'},
  qDraw:{en:'Draw my plot',hi:'मेरा खेत बनाएँ'},qDrawB:{en:'Tap corners or walk with GPS',hi:'कोने छुएँ या GPS से चलें'},
  qMineB:{en:'{n} saved',hi:'{n} सहेजे गए'},qMineNone:{en:'Nothing saved yet',hi:'अभी कुछ सहेजा नहीं'},
  layerMap:{en:'Map view',hi:'नक्शा दृश्य'},layerSat:{en:'Satellite view',hi:'सैटेलाइट दृश्य'},
  riskScale:{en:'Risk level',hi:'जोखिम स्तर'},
  town:{en:'Town',hi:'नगर'},townBody:{en:'Urban body',hi:'नगर निकाय'},
  t_np:{en:'Nagar Panchayat',hi:'नगर पंचायत'},t_npp:{en:'Nagar Palika Parishad',hi:'नगर पालिका परिषद'},t_mc:{en:'Nagar Nigam (Municipal Corporation)',hi:'नगर निगम'},
  t_cb:{en:'Cantonment Board',hi:'छावनी परिषद'},t_its:{en:'Industrial township',hi:'औद्योगिक नगर'},
  townRecords:{en:'How land records work in a town',hi:'नगर में भूमि रिकॉर्ड कैसे काम करते हैं'},
  townStep1:{en:'This outline is the whole town (Census 2011), not one revenue village. Inside town limits, land is still divided into revenue villages (मौज़ा / mauza).',hi:'यह सीमा पूरे नगर की है (जनगणना 2011), किसी एक राजस्व ग्राम की नहीं। नगर सीमा के अंदर भी ज़मीन राजस्व ग्रामों (मौज़ा) में बँटी होती है।'},
  townStep2:{en:'For farm land or a khasra inside the town: find the mauza name on your papers (or ask the lekhpal), then search that mauza on UP Bhulekh under tehsil <b>{t}</b>.',hi:'नगर के अंदर खेती की ज़मीन या खसरे के लिए: अपने काग़ज़ों से मौज़ा का नाम लें (या लेखपाल से पूछें), फिर UP भूलेख पर तहसील <b>{t}</b> में वह मौज़ा खोजें।'},
  townStep3:{en:'Houses and plots in built-up areas are usually not in a khatauni. Check property / house-tax records with the {b} (e-Nagar Sewa), and registered sale deeds on igrsup.gov.in.',hi:'बसे हुए इलाक़ों के मकान और प्लॉट आम तौर पर खतौनी में नहीं होते। संपत्ति / गृहकर रिकॉर्ड {b} (ई-नगर सेवा) में देखें, और रजिस्टर्ड बैनामे igrsup.gov.in पर।'},
  townStep3cb:{en:'Houses and plots in a cantonment are usually not in a khatauni. Cantonment land is managed by the Cantonment Board (Ministry of Defence) — ask its office for property records, and check registered sale deeds on igrsup.gov.in.',hi:'छावनी क्षेत्र के मकान और प्लॉट आम तौर पर खतौनी में नहीं होते। छावनी की ज़मीन छावनी परिषद (रक्षा मंत्रालय) के अधीन है — संपत्ति रिकॉर्ड के लिए उसके कार्यालय से पूछें, और रजिस्टर्ड बैनामे igrsup.gov.in पर देखें।'},
  addPlotTown:{en:'Add my plot in this town',hi:'इस नगर में मेरा खेत जोड़ें'},
  note:{en:'Note',hi:'नोट'},showOnMap:{en:'Show on map',hi:'नक्शे पर दिखाएँ'},
  sampleSrc:{en:'Example only — not a real record.',hi:'केवल उदाहरण — असली रिकॉर्ड नहीं।'},
  loadFail:{en:'Could not load map data. Check your internet and reload.',hi:'नक्शे का डेटा लोड नहीं हुआ। इंटरनेट जाँचें और दोबारा खोलें।'},
  storeFail:{en:'Could not save — browser storage is blocked.',hi:'सहेजा नहीं जा सका — ब्राउज़र स्टोरेज बंद है।'}
});
const t=k=>(T[k]?T[k][LANG]:k);

/* ---------- classes & flags (plain-language engine) ---------- */
const CLASSES={
 bt:{hi:'संक्रमणीय भूमिधर',en:'Bhumidhar with transferable rights',sell:{en:'Yes — normally can be sold, gifted or mortgaged.',hi:'हाँ — सामान्यतः बेची, दान या गिरवी रखी जा सकती है।'},
     mean:{en:'The most common and safest class for farmland. The holder can sell, gift, mortgage and pass it to heirs.',hi:'खेती की ज़मीन की सबसे आम और सुरक्षित श्रेणी। खातेदार बेच, दान, गिरवी और विरासत में दे सकता है।'}},
 bnt:{hi:'असंक्रमणीय भूमिधर',en:'Bhumidhar with non-transferable rights',sell:{en:'Not freely — sale is restricted by law.',hi:'आसानी से नहीं — क़ानूनी रोक है।'},
     mean:{en:'The holder can farm it and heirs can inherit it, but it cannot be freely sold. Often land given on government lease (patta). Buying it is risky.',hi:'खेती कर सकते हैं और वारिसों को मिलती है, पर आसानी से बेची नहीं जा सकती। अक्सर सरकारी पट्टे की ज़मीन। ख़रीदना जोखिम भरा।'}},
 asami:{hi:'आसामी',en:'Asami',sell:{en:'No — the holder has limited rights.',hi:'नहीं — धारक के अधिकार सीमित हैं।'},
     mean:{en:'A tenant-like holder with limited, often temporary rights. Cannot sell the land.',hi:'किरायेदार जैसा धारक, सीमित और अक्सर अस्थायी अधिकार। ज़मीन बेच नहीं सकता।'}},
 gs:{hi:'ग्राम सभा / सार्वजनिक भूमि',en:'Gram Sabha / public land',sell:{en:'No — public land cannot be privately sold.',hi:'नहीं — सार्वजनिक भूमि निजी तौर पर नहीं बिकती।'},
     mean:{en:'Land held for the village (pasture, pond, threshing floor, etc.). Deals that "sell" such land are a common fraud — avoid.',hi:'गाँव की साझा भूमि (चारागाह, तालाब, खलिहान आदि)। ऐसी ज़मीन "बेचने" के सौदे आम धोखाधड़ी हैं — बचें।'}}
};
const FLAGS={
 shared:{lvl:'warn',ic:'👥',h:{en:'Shared khata — undivided shares',hi:'साझा खाता — अविभाजित हिस्से'},
   b:{en:'{n} people are recorded together. Each holds a share (like {f}) of the whole land — not a marked-out piece. Nobody owns a specific corner until a partition (बंटवारा).',hi:'{n} लोगों के नाम साथ दर्ज हैं। हर व्यक्ति का पूरी ज़मीन में हिस्सा ({f} जैसा) है — कोई अलग टुकड़ा नहीं। बंटवारे से पहले किसी कोने का अलग मालिक नहीं।'},
   d:{en:'If buying, all co-holders\' consent or a partition order matters. If you are a co-holder, a partition case at the tehsil marks out your share.',hi:'ख़रीदते समय सभी सह-खातेदारों की सहमति या बंटवारा आदेश ज़रूरी है। आप सह-खातेदार हैं तो तहसील में बंटवारे का वाद आपका हिस्सा अलग कराता है।'}},
 loan:{lvl:'warn',ic:'🏦',h:{en:'Loan / mortgage recorded',hi:'ऋण / बंधक दर्ज'},
   b:{en:'A bank loan is secured on this land (e.g. Kisan Credit Card).',hi:'इस ज़मीन पर बैंक ऋण दर्ज है (जैसे किसान क्रेडिट कार्ड)।'},
   d:{en:'Before any sale the loan should be repaid and the entry removed (no-dues from the bank).',hi:'बिक्री से पहले ऋण चुकाकर बैंक से अदेयता लेकर प्रविष्टि हटवानी चाहिए।'}},
 court:{lvl:'bad',ic:'⚖️',h:{en:'Court case pending',hi:'वाद विचाराधीन'},
   b:{en:'Ownership, share or boundary is disputed in a court.',hi:'स्वामित्व, हिस्सा या सीमा को लेकर न्यायालय में विवाद चल रहा है।'},
   d:{en:'Do not buy or pay an advance until the case is decided. Check status free on vaad.up.nic.in (revenue courts).',hi:'फ़ैसले तक न ख़रीदें, न बयाना दें। राजस्व वाद की स्थिति vaad.up.nic.in पर मुफ़्त देखें।'}},
 mut:{lvl:'warn',ic:'🔄',h:{en:'Name transfer (नामांतरण) pending',hi:'नामांतरण लंबित'},
   b:{en:'A sale or inheritance happened but the record isn\'t updated yet, so it may still show the old holder.',hi:'बिक्री या विरासत हुई है पर रिकॉर्ड अभी अपडेट नहीं हुआ, इसलिए पुराना नाम दिख सकता है।'},
   d:{en:'Ask for the registered sale deed / order and track the mutation case on vaad.up.nic.in.',hi:'पंजीकृत बैनामा / आदेश माँगें और नामांतरण वाद vaad.up.nic.in पर देखें।'}},
 varasat:{lvl:'warn',ic:'🕯️',h:{en:'Heirs not recorded (वरासत)',hi:'वरासत दर्ज नहीं'},
   b:{en:'A recorded holder has died but the legal heirs\' names aren\'t entered yet.',hi:'दर्ज खातेदार की मृत्यु हो चुकी है पर वारिसों के नाम अभी दर्ज नहीं हैं।'},
   d:{en:'Heirs apply for varasat (often online via the UP revenue portal or at the tehsil / lekhpal). Until then, a clean sale is difficult.',hi:'वारिस वरासत के लिए आवेदन करें (राजस्व पोर्टल पर या तहसील / लेखपाल के पास)। तब तक साफ़ बिक्री कठिन है।'}},
 na:{lvl:'ok',ic:'🏠',h:{en:'Declared non-agricultural (धारा 80)',hi:'अकृषिक घोषित (धारा 80)'},
   b:{en:'The land is declared for non-farm use (e.g. house, shop), which matters if you plan to build.',hi:'ज़मीन ग़ैर-कृषि उपयोग (मकान, दुकान) के लिए घोषित है — निर्माण के लिए यह ज़रूरी बात है।'},
   d:{en:'For building you still need a sanctioned map from the development authority / local body where required.',hi:'निर्माण के लिए जहाँ ज़रूरी हो वहाँ विकास प्राधिकरण / स्थानीय निकाय से नक्शा पास कराना होगा।'}},
 bnt:{lvl:'bad',ic:'🚫',h:{en:'Sale restricted (असंक्रमणीय)',hi:'बिक्री पर रोक (असंक्रमणीय)'},
   b:{en:'This class of holder cannot freely sell the land.',hi:'इस श्रेणी का धारक ज़मीन आसानी से नहीं बेच सकता।'},
   d:{en:'Avoid buying unless a competent revenue officer has changed the class by order.',hi:'जब तक सक्षम राजस्व अधिकारी के आदेश से श्रेणी न बदले, न ख़रीदें।'}},
 asami:{lvl:'bad',ic:'🚫',h:{en:'Limited rights (आसामी)',hi:'सीमित अधिकार (आसामी)'},
   b:{en:'The recorded person is not a full owner-holder.',hi:'दर्ज व्यक्ति पूरा भूमिधर नहीं है।'},
   d:{en:'Do not buy from an asami.',hi:'आसामी से ज़मीन न ख़रीदें।'}},
 gs:{lvl:'pub',ic:'🏛️',h:{en:'Public land',hi:'सार्वजनिक भूमि'},
   b:{en:'Recorded as Gram Sabha / public use land.',hi:'ग्राम सभा / सार्वजनिक उपयोग की भूमि के रूप में दर्ज।'},
   d:{en:'Never buy. Encroachment on public land can lead to eviction and penalty.',hi:'कभी न ख़रीदें। सार्वजनिक भूमि पर क़ब्ज़ा बेदख़ली और जुर्माने का कारण बन सकता है।'}}
};
const USES={farm:{en:'Agricultural',hi:'कृषि'},orchard:{en:'Orchard',hi:'बाग़'},abadi:{en:'Abadi (village habitation)',hi:'आबादी'},pond:{en:'Pond',hi:'तालाब'},pasture:{en:'Pasture',hi:'चारागाह'},banjar:{en:'Barren',hi:'बंजर'}};


const WORDS=[
 ['खसरा','Khasra','The plot number and plot register. Each piece of land in the village has its own khasra (also called gata) number, area and land type.','गाँव के हर खेत की अलग संख्या और उसका रजिस्टर — रकबा और भूमि प्रकार सहित।'],
 ['गाटा संख्या','Gata number','Another name for the khasra / plot number used in UP records.','खसरा संख्या का ही दूसरा नाम।'],
 ['खतौनी','Khatauni','The record of rights in UP: lists each khata (account), who is recorded on it, their shares, and all the khasra plots under that account.','यूपी का अधिकार अभिलेख: हर खाते में किसका नाम है, कितना हिस्सा है, और उस खाते में कौन-कौन से खसरे हैं।'],
 ['खाता संख्या','Khata number','The account number in the khatauni. One khata can contain several khasra plots and several co-holders.','खतौनी में खाते की संख्या। एक खाते में कई खसरे और कई सह-खातेदार हो सकते हैं।'],
 ['खातेदार / सह-खातेदार','Khatedar / co-holder','The person(s) recorded on the khata. Co-holders share the whole land in undivided shares.','खाते में दर्ज व्यक्ति। सह-खातेदारों का पूरी ज़मीन में अविभाजित हिस्सा होता है।'],
 ['फसली वर्ष','Fasli year','The revenue year used in records, starting around July. Roughly Fasli = calendar year minus 592/593.','राजस्व वर्ष, लगभग जुलाई से शुरू। मोटे तौर पर फसली = ईसवी वर्ष − 592/593।'],
 ['संक्रमणीय भूमिधर','Bhumidhar (transferable)','The standard farmland holder who can sell, gift or mortgage the land.','सामान्य भूमिधर जो ज़मीन बेच, दान या गिरवी रख सकता है।'],
 ['असंक्रमणीय भूमिधर','Bhumidhar (non-transferable)','A holder who can farm and pass on the land by inheritance but cannot freely sell it.','खेती और विरासत का अधिकार, पर आसानी से बिक्री नहीं।'],
 ['आसामी','Asami','A holder with limited, tenant-like rights.','सीमित, किरायेदार जैसे अधिकारों वाला धारक।'],
 ['ग्राम सभा भूमि','Gram Sabha land','Village public land such as ponds, pastures and paths. Not for private sale.','तालाब, चारागाह, रास्ते जैसी गाँव की सार्वजनिक भूमि। निजी बिक्री योग्य नहीं।'],
 ['नामांतरण / दाखिल-ख़ारिज','Mutation','Updating the record after a sale or inheritance. It is for revenue purposes and does not by itself create ownership.','बिक्री या विरासत के बाद रिकॉर्ड में नाम बदलना। यह राजस्व के लिए है, स्वयं स्वामित्व नहीं बनाता।'],
 ['वरासत','Varasat','Entering heirs\' names in the record after a holder dies.','खातेदार की मृत्यु के बाद वारिसों के नाम दर्ज करना।'],
 ['बंटवारा','Partition','A case that divides a shared khata so each co-holder gets a marked-out portion.','साझा खाते को बाँटकर हर सह-खातेदार का अलग हिस्सा तय करने का वाद।'],
 ['पैमाइश','Measurement (paimaish)','Official measurement of the plot on the ground, done by revenue staff on application.','आवेदन पर राजस्व कर्मियों द्वारा ज़मीन की मौके पर नाप।'],
 ['लेखपाल','Lekhpal','The village-level revenue official who maintains land records (the patwari in other states).','गाँव स्तर का राजस्व कर्मचारी जो भू-अभिलेख रखता है (अन्य राज्यों में पटवारी)।'],
 ['राजस्व निरीक्षक / कानूनगो','Revenue Inspector','Supervises lekhpals and reports on mutation and other cases.','लेखपालों का पर्यवेक्षक; नामांतरण आदि पर रिपोर्ट देता है।'],
 ['तहसीलदार / एसडीएम','Tahsildar / SDM','Revenue officers who decide mutation, partition and many land cases at tehsil level.','तहसील स्तर पर नामांतरण, बंटवारा आदि मामलों का निर्णय करने वाले अधिकारी।'],
 ['शजरा / भू-नक्शा','Shajra / Bhu-Naksha','The village map showing every khasra plot. Available online at upbhunaksha.gov.in.','गाँव का नक्शा जिसमें हर खसरा दिखता है। upbhunaksha.gov.in पर उपलब्ध।'],
 ['बैनामा','Sale deed (bainama)','The registered document by which land is sold. Registered at the sub-registrar office.','ज़मीन बेचने का पंजीकृत दस्तावेज़, उप-निबंधक कार्यालय में पंजीकृत।'],
 ['भार-मुक्त प्रमाण पत्र','Encumbrance certificate','Shows registered transactions (sale, mortgage) on a property over a period. Search via igrsup.gov.in.','किसी अवधि में संपत्ति के पंजीकृत लेन-देन दिखाता है। igrsup.gov.in पर खोजें।'],
 ['घरौनी','Gharauni','UP\'s property card for village houses (abadi), issued under the SVAMITVA drone survey.','स्वामित्व योजना के ड्रोन सर्वे से गाँव के घरों (आबादी) का संपत्ति कार्ड।'],
 ['आबादी','Abadi','The inhabited part of the village where houses stand.','गाँव का बसा हुआ हिस्सा जहाँ घर बने हैं।'],
 ['धारा 80','Section 80 declaration','A declaration under the UP Revenue Code that land is used for non-agricultural purposes.','यूपी राजस्व संहिता के तहत ज़मीन को अकृषिक उपयोग के लिए घोषित करना।'],
 ['बंधक','Mortgage (bandhak)','Land pledged as security for a loan. Shown in the remarks of the khatauni.','ऋण के बदले गिरवी रखी गई ज़मीन। खतौनी की टिप्पणी में दिखता है।'],
 ['हेक्टेयर / बीघा / बिस्वा','Hectare / Bigha / Biswa','1 hectare = 2.471 acres = 10,000 sq m. Bigha and biswa (1/20 bigha) vary by district.','1 हेक्टेयर = 2.471 एकड़ = 10,000 वर्ग मी.। बीघा और बिस्वा (1/20 बीघा) ज़िले के अनुसार बदलते हैं।']
];

function renderGuide(){
  const hi=LANG==='hi';
  document.getElementById('guideBody').innerHTML=hi?`
  <h3>1. अपनी खतौनी देखें</h3><span class="url">upbhulekh.gov.in</span>
  <ol><li>"खतौनी (अधिकार अभिलेख) की नक़ल देखें" चुनें और कैप्चा भरें।</li><li>जनपद → तहसील → ग्राम चुनें।</li><li>खसरा/गाटा संख्या, खाता संख्या या नाम से खोजें।</li><li>खतौनी खुलने पर श्रेणी, हिस्सा, रकबा और टिप्पणी कॉलम देखें — फिर "मेरी खतौनी समझाएँ" टैब में भरें।</li></ol>
  <h3>2. अपने खेत का नक्शा देखें</h3><span class="url">upbhunaksha.gov.in</span>
  <ol><li>जनपद, तहसील, ग्राम चुनें।</li><li>नक्शे पर खसरा खोजें या उस पर क्लिक करें — प्लॉट की जानकारी दिखेगी।</li></ol>
  <h3>3. वाद / नामांतरण की स्थिति</h3><span class="url">vaad.up.nic.in</span>
  <ol><li>राजस्व न्यायालय कंप्यूटरीकृत प्रणाली (RCCMS) पर ग्राम/वाद संख्या से खोजें।</li><li>देखें कि आपके खसरे पर कोई वाद या नामांतरण लंबित तो नहीं।</li></ol>
  <h3>4. रजिस्ट्री / भार-मुक्त प्रमाण पत्र</h3><span class="url">igrsup.gov.in</span>
  <ol><li>संपत्ति के पंजीकृत बैनामे और बंधक की खोज करें।</li><li>प्रमाणित प्रति के लिए सरकारी शुल्क लग सकता है — देखना/खोजना अक्सर मुफ़्त होता है।</li></ol>
  <div class="note"><b>ध्यान दें:</b> कैप्चा स्वयं भरें। किसी ऐप या व्यक्ति को अपनी जानकारी के लिए पैसे न दें — ये सब सरकारी साइटों पर मुफ़्त है। नकली "भूलेख" साइटों से सावधान रहें।</div>`
  :`
  <h3>1. View your khatauni</h3><span class="url">upbhulekh.gov.in</span>
  <ol><li>Choose "खतौनी (अधिकार अभिलेख) की नक़ल देखें" (view copy of record of rights) and fill the captcha.</li><li>Select district → tehsil → village.</li><li>Search by khasra/gata number, khata number or holder's name.</li><li>Read the class, share, area and remarks columns — then enter them in the "Explain my khatauni" tab.</li></ol>
  <h3>2. See your plot on the official map</h3><span class="url">upbhunaksha.gov.in</span>
  <ol><li>Select district, tehsil and village.</li><li>Find your khasra on the map or click it to see the plot details.</li></ol>
  <h3>3. Check court cases & mutation</h3><span class="url">vaad.up.nic.in</span>
  <ol><li>Search the Revenue Court Computerised Management System (RCCMS) by village or case number.</li><li>Look for any case or pending mutation on your khasra.</li></ol>
  <h3>4. Registry & encumbrance search</h3><span class="url">igrsup.gov.in</span>
  <ol><li>Search registered sale deeds and mortgages on a property.</li><li>Certified copies may carry a small government fee; searching is often free.</li></ol>
  <div class="note"><b>Tip:</b> always fill captchas yourself. You never need to pay an app or agent to see these — they're free on government sites. Beware of look-alike "Bhulekh" websites.</div>`;
}

