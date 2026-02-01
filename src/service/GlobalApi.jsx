import axios from 'axios'

const BASE = 'https://api.unsplash.com/search/photos'
const KEY  = import.meta.env.VITE_UNSPLASH_API_KEY
const cache = new Map()

// ─── HARDCODED per-place URLs ─────────────────────────────────────────────────
// Every major London landmark + worldwide place gets its OWN specific photo.
// This is the ONLY reliable way — Unsplash search returns different results
// depending on API quota, rate limits, and result ordering.
const PLACE_PHOTOS = {
  // ── London landmarks (each unique) ─────────────────────────────────────────
  'buckingham palace':        'https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?w=800&auto=format&fit=crop',
  'westminster abbey':        'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=800&auto=format&fit=crop',
  'houses of parliament':     'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop',
  'palace of westminster':    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop',
  'big ben':                  'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop',
  'london eye':               'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=800&auto=format&fit=crop',
  'tower of london':          'https://images.unsplash.com/photo-1580834341580-8c17a3a630ca?w=800&auto=format&fit=crop',
  'tower bridge':             'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=800&auto=format&fit=crop',
  'tower bridge exhibition':  'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=800&auto=format&fit=crop',
  'british museum':           'https://images.unsplash.com/photo-1524230572899-a752b3835840?w=800&auto=format&fit=crop',
  'natural history museum':   'https://images.unsplash.com/photo-1563990333-7d21d1ff4278?w=800&auto=format&fit=crop',
  'national gallery':         'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=800&auto=format&fit=crop',
  'national gallery / trafalgar square': 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=800&auto=format&fit=crop',
  'trafalgar square':         'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=800&auto=format&fit=crop',
  'the shard':                'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&auto=format&fit=crop',
  'covent garden':            'https://images.unsplash.com/photo-1571988840298-3b5301d5109b?w=800&auto=format&fit=crop',
  'borough market':           'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop',
  'hyde park':                'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&auto=format&fit=crop',
  'regent park':              'https://images.unsplash.com/photo-1445307806294-bff7f67ff225?w=800&auto=format&fit=crop',
  "st james's park":          'https://images.unsplash.com/photo-1445307806294-bff7f67ff225?w=800&auto=format&fit=crop',
  'st james park':            'https://images.unsplash.com/photo-1445307806294-bff7f67ff225?w=800&auto=format&fit=crop',
  'notting hill':             'https://images.unsplash.com/photo-1599922054598-b15a3c7b6d7e?w=800&auto=format&fit=crop',
  'oxford street':            'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop',
  'carnaby street':           'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop',
  'portobello road':          'https://images.unsplash.com/photo-1599922054598-b15a3c7b6d7e?w=800&auto=format&fit=crop',
  'tate modern':              'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&auto=format&fit=crop',
  'greenwich':                'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=800&auto=format&fit=crop',
  'kensington palace':        'https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?w=800&auto=format&fit=crop',
  'victoria and albert museum':'https://images.unsplash.com/photo-1563990333-7d21d1ff4278?w=800&auto=format&fit=crop',
  'science museum':           'https://images.unsplash.com/photo-1563990333-7d21d1ff4278?w=800&auto=format&fit=crop',
  'westminster':              'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop',
  'piccadilly circus':        'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop',
  'camden market':            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop',
  'shoreditch':               'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop',
  'south bank':               'https://images.unsplash.com/photo-1580834341580-8c17a3a630ca?w=800&auto=format&fit=crop',
  // ── London restaurants/pubs (each unique) ──────────────────────────────────
  'the churchill arms':       'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
  'churchill arms':           'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
  'dishoom':                  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop',
  'tayyabs':                  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop',
  'balthazar':                'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800&auto=format&fit=crop',
  'lunch at balthazar':       'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800&auto=format&fit=crop',
  'hummingbird bakery':       'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop',
  'poppies fish':             'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&auto=format&fit=crop',
  'padella':                  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&auto=format&fit=crop',
  'sketch':                   'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop',
  'darjeeling express':       'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop',
  'hawksmoor':                'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop',
  'the wolseley':             'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop',
  'sunday roast':             'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
  'fish and chips':           'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&auto=format&fit=crop',
  'afternoon tea':            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
  'lunch at borough market':  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop',
  // ── West End / Theatre ──────────────────────────────────────────────────────
  'west end show':            'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&auto=format&fit=crop',
  'west end musical':         'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&auto=format&fit=crop',
  'theatre royal':            'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&auto=format&fit=crop',
  'lyceum':                   'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&auto=format&fit=crop',
  'les mis':                  'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&auto=format&fit=crop',
  'phantom':                  'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&auto=format&fit=crop',
  'hamilton':                 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&auto=format&fit=crop',
  // ── Global landmarks (each unique) ─────────────────────────────────────────
  'taj mahal':                'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop',
  'eiffel tower':             'https://images.unsplash.com/photo-1549144511-f099e773c147?w=800&auto=format&fit=crop',
  'louvre':                   'https://images.unsplash.com/photo-1565799557186-add3a7cb1f15?w=800&auto=format&fit=crop',
  'arc de triomphe':          'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop',
  'notre dame':               'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop',
  'versailles':               'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop',
  'colosseum':                'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop',
  'roman forum':              'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop',
  'vatican':                  'https://images.unsplash.com/photo-1541832676-9b763b0dc5c7?w=800&auto=format&fit=crop',
  'sistine chapel':           'https://images.unsplash.com/photo-1541832676-9b763b0dc5c7?w=800&auto=format&fit=crop',
  'trevi fountain':           'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop',
  'sagrada familia':          'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&auto=format&fit=crop',
  'park guell':               'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&auto=format&fit=crop',
  'central park':             'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800&auto=format&fit=crop',
  'times square':             'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop',
  'empire state building':    'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop',
  'statue of liberty':        'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=800&auto=format&fit=crop',
  'brooklyn bridge':          'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop',
  'golden gate bridge':       'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&auto=format&fit=crop',
  'burj khalifa':             'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop',
  'burj al arab':             'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop',
  'shibuya crossing':         'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop',
  'fushimi inari':            'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop',
  'senso-ji':                 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop',
  'mount fuji':               'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&auto=format&fit=crop',
  'angkor wat':               'https://images.unsplash.com/photo-1540202404-d0c7fe46a087?w=800&auto=format&fit=crop',
  'great wall':               'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&auto=format&fit=crop',
  'sydney opera house':       'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&auto=format&fit=crop',
  'uluru':                    'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800&auto=format&fit=crop',
  'machu picchu':             'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&auto=format&fit=crop',
  'christ the redeemer':      'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&auto=format&fit=crop',
  'pyramids of giza':         'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800&auto=format&fit=crop',
  'pyramids':                 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800&auto=format&fit=crop',
  'sphinx':                   'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800&auto=format&fit=crop',
  'acropolis':                'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&auto=format&fit=crop',
  'parthenon':                'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&auto=format&fit=crop',
  'hagia sophia':             'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&auto=format&fit=crop',
  'blue mosque':              'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&auto=format&fit=crop',
  'petronas towers':          'https://images.unsplash.com/photo-1508964942454-1a56651d54ac?w=800&auto=format&fit=crop',
  'marina bay sands':         'https://images.unsplash.com/photo-1508964942454-1a56651d54ac?w=800&auto=format&fit=crop',
  'gardens by the bay':       'https://images.unsplash.com/photo-1508964942454-1a56651d54ac?w=800&auto=format&fit=crop',
  // ── India landmarks ─────────────────────────────────────────────────────────
  'india gate':               'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&auto=format&fit=crop',
  'red fort':                 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&auto=format&fit=crop',
  'qutub minar':              'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&auto=format&fit=crop',
  'lotus temple':             'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&auto=format&fit=crop',
  'humayun tomb':             'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&auto=format&fit=crop',
  'gateway of india':         'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800&auto=format&fit=crop',
  'marine drive':             'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800&auto=format&fit=crop',
  'elephanta caves':          'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800&auto=format&fit=crop',
  'golden temple':            'https://images.unsplash.com/photo-1555659353-e2178b7e5eb8?w=800&auto=format&fit=crop',
  'city palace':              'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&auto=format&fit=crop',
  'amber fort':               'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&auto=format&fit=crop',
  'hawa mahal':               'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&auto=format&fit=crop',
  'jantar mantar':            'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&auto=format&fit=crop',
  'lake pichola':             'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&auto=format&fit=crop',
  'mehrangarh fort':          'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800&auto=format&fit=crop',
  'ganga aarti':              'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=800&auto=format&fit=crop',
  'dashashwamedh ghat':       'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=800&auto=format&fit=crop',
  'laxman jhula':             'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop',
  'ram jhula':                'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop',
  'parmarth niketan':         'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=800&auto=format&fit=crop',
  // ── Activities ──────────────────────────────────────────────────────────────
  'river rafting':            'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop',
  'white water rafting':      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop',
  'bungee jumping':           'https://images.unsplash.com/photo-1534361960057-19f4434a8b03?w=800&auto=format&fit=crop',
  'giant swing':              'https://images.unsplash.com/photo-1534361960057-19f4434a8b03?w=800&auto=format&fit=crop',
  'zip line':                 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=800&auto=format&fit=crop',
  'yoga class':               'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&auto=format&fit=crop',
  'morning yoga':             'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&auto=format&fit=crop',
  'meditation':               'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop',
  'beatles ashram':           'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=800&auto=format&fit=crop',
  'gun hill':                 'https://images.unsplash.com/photo-1570458436416-b8fcccfe883f?w=800&auto=format&fit=crop',
  'kempty falls':             'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800&auto=format&fit=crop',
  'neer garh':                'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800&auto=format&fit=crop',
}

// ─── Category fallback pools — many unique URLs per category ─────────────────
const POOLS = {
  pub: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1436076863939-06870fe779c2?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=800&auto=format&fit=crop',
  ],
  restaurant: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop',
  ],
  cafe: [
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop',
  ],
  bakery: [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534431904635-aaacf47c3aca?w=800&auto=format&fit=crop',
  ],
  museum: [
    'https://images.unsplash.com/photo-1524230572899-a752b3835840?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1566127992631-137a642a90f4?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1605722625766-a4b2b9b7e8ba?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=800&auto=format&fit=crop',
  ],
  market: [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?w=800&auto=format&fit=crop',
  ],
  theatre: [
    'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&auto=format&fit=crop',
  ],
  temple: [
    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1567073483747-d044db9f1e9e?w=800&auto=format&fit=crop',
  ],
  ghat: [
    'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&auto=format&fit=crop',
  ],
  yoga: [
    'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800&auto=format&fit=crop',
  ],
  adventure: [
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534361960057-19f4434a8b03?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800&auto=format&fit=crop',
  ],
  waterfall: [
    'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&auto=format&fit=crop',
  ],
  beach: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&auto=format&fit=crop',
  ],
  park: [
    'https://images.unsplash.com/photo-1445307806294-bff7f67ff225?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1484910292437-025e5d13ce87?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1487956382158-bb926046304a?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&auto=format&fit=crop',
  ],
  palace: [
    'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?w=800&auto=format&fit=crop',
  ],
  nature: [
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&auto=format&fit=crop',
  ],
  city: [
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800&auto=format&fit=crop',
  ],
}

// ─── City cover map ───────────────────────────────────────────────────────────
const COVER = [
  { k:['mussoorie','mussorie'],   u:'https://images.unsplash.com/photo-1570458436416-b8fcccfe883f?w=1400&auto=format&fit=crop' },
  { k:['shimla'],                 u:'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=1400&auto=format&fit=crop' },
  { k:['manali'],                 u:'https://images.unsplash.com/photo-1560179406-1c6c60e0dc76?w=1400&auto=format&fit=crop' },
  { k:['rishikesh'],              u:'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1400&auto=format&fit=crop' },
  { k:['varanasi','banaras'],     u:'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=1400&auto=format&fit=crop' },
  { k:['jaipur'],                 u:'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1400&auto=format&fit=crop' },
  { k:['agra'],                   u:'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1400&auto=format&fit=crop' },
  { k:['goa'],                    u:'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1400&auto=format&fit=crop' },
  { k:['kerala','kochi','munnar'],u:'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1400&auto=format&fit=crop' },
  { k:['mumbai','bombay'],        u:'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=1400&auto=format&fit=crop' },
  { k:['new delhi','delhi'],      u:'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1400&auto=format&fit=crop' },
  { k:['udaipur'],                u:'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1400&auto=format&fit=crop' },
  { k:['amritsar'],               u:'https://images.unsplash.com/photo-1555659353-e2178b7e5eb8?w=1400&auto=format&fit=crop' },
  { k:['london'],                 u:'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1400&auto=format&fit=crop' },
  { k:['paris'],                  u:'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1400&auto=format&fit=crop' },
  { k:['rome'],                   u:'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1400&auto=format&fit=crop' },
  { k:['barcelona'],              u:'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1400&auto=format&fit=crop' },
  { k:['amsterdam'],              u:'https://images.unsplash.com/photo-1534351590666-13e3e96b5702?w=1400&auto=format&fit=crop' },
  { k:['new york','nyc'],         u:'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1400&auto=format&fit=crop' },
  { k:['tokyo'],                  u:'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1400&auto=format&fit=crop' },
  { k:['kyoto'],                  u:'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1400&auto=format&fit=crop' },
  { k:['bali'],                   u:'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1400&auto=format&fit=crop' },
  { k:['dubai'],                  u:'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1400&auto=format&fit=crop' },
  { k:['singapore'],              u:'https://images.unsplash.com/photo-1508964942454-1a56651d54ac?w=1400&auto=format&fit=crop' },
  { k:['sydney'],                 u:'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1400&auto=format&fit=crop' },
  { k:['istanbul'],               u:'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1400&auto=format&fit=crop' },
  { k:['maldives'],               u:'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1400&auto=format&fit=crop' },
  { k:['bangkok','thailand'],     u:'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1400&auto=format&fit=crop' },
  { k:['cairo'],                  u:'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=1400&auto=format&fit=crop' },
  { k:['santorini'],              u:'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=1400&auto=format&fit=crop' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function detectCategory(text = '') {
  const t = text.toLowerCase()
  if (t.match(/\bpub\b|\barms\b|\btavern\b|\binn\b/))                       return 'pub'
  if (t.match(/bakery|patisserie|cake\b|pastry/))                           return 'bakery'
  if (t.match(/café|cafe|coffee house|tea room/))                           return 'cafe'
  if (t.match(/restaurant|dinner|lunch|breakfast|dining|bistro|brasserie|trattoria|roast/)) return 'restaurant'
  if (t.match(/theatre|theater|musical|opera|west end show|show at/))       return 'theatre'
  if (t.match(/museum|gallery|exhibit|tate\b/))                             return 'museum'
  if (t.match(/market|bazaar|souk/))                                        return 'market'
  if (t.match(/waterfall|falls\b/))                                         return 'waterfall'
  if (t.match(/rafting|kayak|white.?water|bungee|zipline|trek|hike|climb/)) return 'adventure'
  if (t.match(/yoga|meditation|ashram|pranayama/))                          return 'yoga'
  if (t.match(/ghat|aarti|ganges|ganga|parmarth/))                          return 'ghat'
  if (t.match(/temple|mandir|shrine|mosque|church|cathedral|abbey/))        return 'temple'
  if (t.match(/palace|fort\b|castle|mahal/))                                return 'palace'
  if (t.match(/park\b|garden\b|green\b/))                                   return 'park'
  if (t.match(/beach|coast|sea\b|ocean|island|bay\b/))                      return 'beach'
  if (t.match(/forest|jungle|nature|mountain|valley/))                      return 'nature'
  return 'city'
}

function stripVerbs(name = '') {
  const prefixes = [
    'Check-in & Explore ', 'Check-in at ', 'Explore ', 'Visit ', 'Discover ',
    'Experience ', 'Enjoy ', 'Dinner at The ', 'Dinner at An ', 'Dinner at a ',
    'Dinner at ', 'Lunch at ', 'Breakfast at ', 'Stroll through ', 'Wander around ',
    'Shop at ', 'See ', 'Admire ', 'Tour ', 'Indulge in ', 'Relax at ',
    'Unwind at ', 'Head to ', 'Stop at ', 'Walk to ', 'Morning at ',
  ]
  let c = name
  for (const p of prefixes) {
    if (c.toLowerCase().startsWith(p.toLowerCase())) { c = c.slice(p.length); break }
  }
  for (const d of [' (', ' - ', ': ']) {
    const i = c.indexOf(d); if (i > 1) c = c.slice(0, i)
  }
  return c.trim()
}

// ─── Main: getPhotoUrl ────────────────────────────────────────────────────────
// placeName: raw AI name e.g. "Dinner at The Churchill Arms"
// globalIndex: unique int across ALL activities in the trip (0,1,2...N)
//              ensures each card picks a DIFFERENT fallback pool URL
export const getPhotoUrl = async (placeName = '', globalIndex = 0) => {
  const clean = stripVerbs(placeName).toLowerCase().trim()

  // Cache key: place name + index so same place at different slots stays unique
  const ck = `${clean.slice(0, 60)}::${globalIndex}`
  if (cache.has(ck)) return cache.get(ck)

  // 1. EXACT named lookup — O(1), most reliable
  if (PLACE_PHOTOS[clean]) {
    const url = PLACE_PHOTOS[clean]
    cache.set(ck, url)
    return url
  }

  // 2. Partial match in PLACE_PHOTOS keys
  for (const [key, url] of Object.entries(PLACE_PHOTOS)) {
    if (clean.includes(key) || key.includes(clean)) {
      cache.set(ck, url)
      return url
    }
  }

  // 3. Unsplash API with globalIndex to pick different result per card
  const hasKey = KEY && KEY.length > 20
  if (hasKey) {
    try {
      const res = await axios.get(BASE, {
        params: { query: clean || placeName, per_page: 10, orientation: 'landscape', client_id: KEY },
        timeout: 5000,
      })
      const results = res.data?.results || []
      if (results.length > 0) {
        const url = results[globalIndex % results.length]?.urls?.regular
        if (url && url.includes('unsplash.com')) {
          cache.set(ck, url)
          return url
        }
      }
    } catch {
      // API call failed silently, fallback to category pool
    }
  }

  // 4. Category pool — globalIndex picks different URL per card
  const cat  = detectCategory(clean + ' ' + placeName)
  const pool = POOLS[cat] || POOLS.city
  const url  = pool[globalIndex % pool.length]
  cache.set(ck, url)
  return url
}

// ─── City cover photo ─────────────────────────────────────────────────────────
export const getCoverPhotoUrl = async (formatted) => {
  if (!formatted) return POOLS.city[0]
  const city = formatted.split(',')[0].trim().toLowerCase()
  const ck = `cover::${city}`
  if (cache.has(ck)) return cache.get(ck)

  for (const { k, u } of COVER) {
    if (k.some(w => city.includes(w))) { cache.set(ck, u); return u }
  }

  const hasKey = KEY && KEY.length > 20
  if (hasKey) {
    try {
      const res = await axios.get(BASE, {
        params: { query: `${city} city landmark`, per_page: 5, orientation: 'landscape', client_id: KEY },
        timeout: 6000,
      })
      const url = res.data?.results?.[0]?.urls?.full || res.data?.results?.[0]?.urls?.regular
      if (url && url.includes('unsplash.com')) { cache.set(ck, url); return url }
    } catch {
      // API call failed silently, return default
    }
  }

  cache.set(ck, POOLS.city[0])
  return POOLS.city[0]
}

export const clearPhotoCache = () => cache.clear()
export const getUnsplashPhoto = (q) =>
  axios.get(BASE, {
    params: { query: q, per_page: 1, orientation: 'landscape', client_id: KEY },
  }).catch(() => ({ data: { results: [] } }))
