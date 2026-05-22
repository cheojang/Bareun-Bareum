#!/usr/bin/env python3
"""
한국어 아동 조음 오류 패턴 시딩 v2
- 음소별 전용 단어 목록으로 변환 커버리지 극대화
- 패턴당 최대 50쌍 목표
"""

import json, subprocess, time, os, tempfile, sys
sys.path.insert(0, os.path.dirname(__file__))
from training_templates import get_full_training

PAT = os.environ.get("SUPABASE_PAT", "")
PROJECT = "dfeisimlrlchjqywymjv"
URL = f"https://api.supabase.com/v1/projects/{PROJECT}/database/query"
PAIRS_PER_PATTERN = 50

# ── 한글 자모 상수 ───────────────────────────────────────────────────────────
CHOSEONG  = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
JUNGSEONG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ']
JONGSEONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㄳ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']

CHO_IDX  = {c: i for i, c in enumerate(CHOSEONG)}
JONG_IDX = {c: i for i, c in enumerate(JONGSEONG)}

def decompose(char):
    code = ord(char) - 0xAC00
    if code < 0 or code > 11171: return None
    return code // 28 // 21, (code // 28) % 21, code % 28

def compose(cho, jung, jong):
    return chr(0xAC00 + cho * 21 * 28 + jung * 28 + jong)

# ── 음소별 단어 목록 (초성 기준) ─────────────────────────────────────────────
WORDS_BY_CHO = {
    'ㄱ': [
        "가방","가위","가족","가요","가스","가게","가을","가슴","가루","가지",
        "갈비","감기","강아지","개구리","개미","개나리","거미","거북이","거울","거짓",
        "게임","고구마","고기","고래","고양이","고추","고장","고무","고사리","곰",
        "공","공룡","과자","과일","교실","구두","구름","구멍","귀","그림",
        "금","기린","기차","기억","기침","김치","깃털","까마귀","꽃","꿀",
        "가루","각도","갈기","감자","강","개","겨울","계단","고집","골목",
        "공기","공책","구슬","그네","기둥","기름","길","깜짝","꼬리","꽃잎",
    ],
    'ㄴ': [
        "나무","나비","나이","나쁘다","낙엽","난로","남자","낮잠","내일","냄비",
        "너구리","넥타이","노래","노랑","눈","눈물","느낌","늑대","나라","나중",
        "나팔","낚시","날개","날씨","남동생","낮","냉장고","넘어지다","노을","농부",
        "뇨뇨","누나","눈사람","니모","나뭇잎","낙타","남산","내복","냄새","너무",
        "넌지시","노란색","노부","논","놀이터","놀잇감","눈깔","뉴스","느티나무",
    ],
    'ㄷ': [
        "다리","다람쥐","단추","달","달팽이","닭","담요","당근","대문","도깨비",
        "도서관","도토리","독수리","돌고래","동생","동화책","두꺼비","두부","드래곤","다이어리",
        "달걀","달력","달빛","담배","대왕","댕기","더위","덥다","도넛","도둑",
        "도마","도마뱀","독","돌","동물","동산","동전","돼지","두더지","두통",
        "득점","들판","등산","디자인","딱따구리","딸기","뚜껑","뜨겁다",
    ],
    'ㄹ': [
        "라면","라디오","램프","레몬","로봇","리본","리모컨","라켓","런닝","레인보우",
        "로켓","루돌프","리듬","리스트","라이터","러닝머신","레슬링","로션","루비","린스",
    ],
    'ㅁ': [
        "마녀","마루","마음","막대","만두","말","망아지","메뚜기","멜론","모기",
        "모자","목도리","목욕","무릎","무지개","문어","물고기","물놀이","미끄럼","민들레",
        "마당","마법","마을","마찰","막내","만화","망원경","매미","머리","먹이",
        "면봉","명절","모래","모양","목걸이","몸통","무서워","문제","미소","미술",
        "마트","막힘","망","매달리다","먼지","멀리","명찰","모든","못","무게",
    ],
    'ㅂ': [
        "바나나","바다","바람","박쥐","반지","발","발가락","방석","배","배꼽",
        "버섯","벌","벌레","병원","보라색","볼","봄","부엉이","부채","비행기",
        "바구니","바늘","반달","반짝","방망이","배추","버스","벚꽃","별","보석",
        "봉투","부드럽다","북","분필","블록","비밀","비타민","빨대","빼빼로",
        "바위","박수","방","배낭","백조","변기","볼펜","부모","비교","빗",
    ],
    'ㅅ': [
        "사과","사자","산","상어","새","새우","생일","서랍","선물","소",
        "소방차","소풍","수박","수영","숟가락","시소","신발","싸움","사슴","사탕",
        "산토끼","상자","새끼","생선","서울","선생님","세탁기","소금","소리","소시지",
        "수건","수달","수레","순서","슈퍼맨","스케이트","스티커","시계","식물","신호등",
        "사막","삼각형","색깔","색연필","샌드위치","서랍장","세상","소나기","송아지","수업",
    ],
    'ㅇ': [
        "아기","아빠","아이","아저씨","악어","안경","야구","야채","얼굴","연필",
        "엄마","오리","오이","옥수수","올챙이","우산","우유","유치원","의자","원숭이",
        "아들","아름답다","아몬드","아침","안방","야자수","어린이","언니","얼음","여름",
        "오빠","오전","온도","올빼미","왕","왕관","외계인","요리","욕조","우편",
        "아랫도리","아이스크림","약","어른","에스키모","여우","여행","예쁘다","오뚝이","올해",
    ],
    'ㅈ': [
        "자동차","자전거","장갑","전화","젓가락","종이","주사위","주스","쥐","지갑",
        "지도","지렁이","지우개","진주","자두","자리","작은","잠자리","장난감","재미",
        "저금","점심","정원","조개","조각","종류","주먹","줄넘기","지구","지름길",
        "자장면","잠","잠옷","장미","저울","제비","조몽","주방","죽","증거",
    ],
    'ㅊ': [
        "책","책상","천사","철봉","치마","치즈","친구","침대","참새","칫솔",
        "채소","처음","청소","체조","초록","초콜릿","추위","춤","층","치아",
        "참기름","찻잔","창문","창의","채찍","척추","천둥","청개구리","체리","초능력",
    ],
    'ㅋ': [
        "카메라","캥거루","커피","코끼리","코알라","크레파스","카드","캠핑","컵","케이크",
        "코","코뿔소","콩","크기","키","킁킁","카드놀이","칼","캔","컴퓨터",
    ],
    'ㅌ': [
        "타조","태양","토끼","토마토","튤립","탁구","탑","테이블","통","틈",
        "타이","탱크","터널","테니스","토성","통나무","튀김","티셔츠","팀","타자기",
    ],
    'ㅍ': [
        "피아노","피자","파란색","팔찌","풍선","팔","파리","포도","편지","펭귄",
        "파도","파워","팔꿈치","팬더","퍼즐","펜","포크","폭포","표범","푸른색",
    ],
    'ㅎ': [
        "하마","호랑이","하늘","해바라기","호박","화분","햇빛","흰색","황새","한복",
        "하교","학교","햄버거","형제","호두","하나","하루","한강","핫도그","해달",
        "행복","허리","헬멧","협동","형광","호수","홍학","화살","화재","환경",
    ],
    'ㄲ': ["까마귀","까치","꽃게","깜짝","껍질","꺾다","끄덕","꽁꽁","꿀벌","끼리끼리"],
    'ㄸ': ["따뜻","떡","뚜껑","떡볶이","따라가다","때리다","또래","뛰어다니다","띠","뚱뚱"],
    'ㅃ': ["빨래","빠르다","뼈","뽑다","뿌리","빨간색","빵","뻐꾸기","뼈대","뽀뽀"],
    'ㅆ': ["씩씩","쓰다","씨앗","쓰레기","썰매","씻다","쑥","씩씩하다","쏘다","쓸다"],
    'ㅉ': ["짜장면","짝꿍","쪽지","찌개","짧다","쯔쯔","째깍","짝","쩔쩔","찍다"],
}

# ── 종성 기준 단어 목록 ──────────────────────────────────────────────────────
WORDS_BY_JONG = {
    'ㄱ': [
        "책","국","박","낙","석","덕","멱","복","숙","육","적","직","칙","특","픽",
        "가득","눈빛","도박","마늘","박수","백조","부엌","사막","색깔","석탄",
        "쌓다","악어","역할","잠깐","정직","지각","축구","터벅","포착","하늘빛",
        "떡","놀이책","자전거책","공책","그림책","동화책","색연필통속책","기억",
    ],
    'ㄴ': [
        "눈","손","산","반","천","문","언","선","진","인","빈","신","원","판","흔",
        "가슴","겨울","기본","나중","단순","동생","두부전","마음","방전","상단",
        "수건","스펀지","신선","아이언","열심","우선","위반","자신","정신","풍선",
        "하늘","가능","건강","나란","도전","망원","배달","부산","새벽빛","친선",
    ],
    'ㄷ': [
        "밭","끝","꽃","낮","빛","맛","옷","팥","솥","젓",
        "가솥","꽃밭","껍질","밑","붓","빗","뼛속","탓","풀빛","화젓가락",
    ],
    'ㄹ': [
        "달","별","물","발","말","칼","불","술","글","길","줄","딸","팔","살","걸",
        "가을","거울","고블린","구슬","나물","단발","도술","돌","동굴","두더지굴",
        "마늘","머리카락","목걸이","물결","반달","별똥별","비발","산길","소울","수박껍질",
        "아들","여울","이글","일몰","자갈","잠결","조절","하늘길","풀","황소",
    ],
    'ㅁ': [
        "봄","이름","바람","마음","꿈","힘","빔","숨","품","담","밤","잠","함",
        "가슴","거품","구름","기름","나무","단계","동굴","두꺼움","마음속","모든것",
        "무게","방법","봄날","사탕","새싹","서울","소금","수줍음","숙제","스승",
        "아줌","이름표","자람","지름","처음","추운","하품","힘내","힘들다",
    ],
    'ㅂ': [
        "밥","잡","납","갑","답","탑","섭","겹","급","업","입","집","무릎","우습","아깝",
        "가뜩","거듭","기겁","나무잎","더겹","달팽이집","대답","도움","바람직","사납",
        "애답","일갈","작업","절겁","접근","조급","쫑긋","징그럽","지겹","텁텁",
    ],
    'ㅅ': [
        "맛","꽃","빛","낫","낮","빗","옷","팥","젓","뫼",
        "가슴","겨울","기쁘다","나뭇","다같","도심","빗물","사랑스럽","수박맛","아침햇",
    ],
    'ㅇ': [
        "공","방","강","왕","빵","장","탕","망","당","양","팡","항","봉","종","통",
        "가방","강아지","거울공","공장","과장","교장","기둥","나팔봉","동방","두통",
        "마당","망아지","미용","방석","배낭","병동","봉투","사방","상상","서방",
        "소방","수동","양방","오방","용감","이중","인방","자방","전봉","중앙",
        "청룡","파방","하방","해방","행방","호강","홍당","화방","황금","흥분",
    ],
    'ㄴ': [
        "눈","손","산","반","천","문","언","선","진","인",
    ],
    'ㄹ': [
        "달","별","물","발","말","칼","불","술","글","길",
    ],
}

# ── 어중 기준 단어 목록 (2음절 이상, 목표음소가 2번째+ 음절 초성) ──────────────
WORDS_MEDIAL = {
    'ㄱ': [
        "아기","야구","오기","이기다","우기다","에구","아고","어거",
        "도깨비","무기","바구니","부기","사기","수기","스기","시기","자기","조기",
        "소고기","돼지고기","닭고기","사탕가게","미끄러지기","밀고당기기",
    ],
    'ㄴ': [
        "바나나","기나긴","도나","소나무","비나리","하나","타나","파나마",
        "아나운서","지나가다","노나다","오나라","자나깨나",
    ],
    'ㄷ': [
        "바다","모도","아도","자두","포도","오두막","도도새","우두머리",
        "세다","타도","거도","소두","이두","보도","화도","해도",
    ],
    'ㄹ': [
        "고래","나라","바리","자루","마루","모래","소리","노래","우리","거리",
        "아리","오리","이리","차례","피리","하리","기름","도로","호루라기",
        "아래","다리","어린이","개구리","달팽이","도토리","딸기","물고기","배구리",
    ],
    'ㅁ': [
        "아마","어머","야무","여무","오마","이모","우무","자모",
        "가마","나마","다모","사마귀","바마","라마","가무","나무",
    ],
    'ㅂ': [
        "아버지","어부","야바위","오빠","이빨","자비","도박","무법","파비",
        "사부","우비","가비","나비","다비","라비","마비",
    ],
    'ㅅ': [
        "아사","어사","야산","오소리","이슬","자살","도시","무서워","파소",
        "가사","나사","다소","라사","마사","바사","사소","하사",
    ],
    'ㅇ': [
        "바위","모양","자연","고양이","소양","조용","도요새","가요","나요","다요",
        "사이","아이","의사","교육","무역","배우","보육","사용","재용",
    ],
    'ㅈ': [
        "아저씨","어제","야자","오자","이자","자전거","도자기","무지개","파자마",
        "사자","가지","나지","다지","라지","마지","바지","사지","하지",
    ],
    'ㅊ': [
        "아차","어처구니","야채","오차","이처럼","자차","도치","무치","파초",
        "소치","가차","나차","다차","라차","마차","바차","하차",
    ],
    'ㅋ': [
        "아코","어크","야크","오케이","이카","자크","도코","무크","파크",
        "가크","나크","다크","라크","마크","바크","사크","하크",
    ],
    'ㅌ': [
        "아트","어터","야탁","오토바이","이터","자태","도태","무태","파태",
        "가타","나타","다타","라타","마타","바타","사타","하타",
    ],
    'ㅍ': [
        "아파","어포","야프","오피","이파","자파","도포","무포","파파",
        "가파","나파","다파","라파","마파","바파","사파","하파",
    ],
    'ㅎ': [
        "아하","어허","야호","오흥","이히","자하","도하","무해","파한",
        "가해","나해","다해","라해","마해","바해","사해","하해",
    ],
}

# ── 변환 규칙 ────────────────────────────────────────────────────────────────
CHO_RULES = {
    # 탈락: → ㅇ(11)
    '탈락':       lambda c: 11,
    '초성탈락':   lambda c: 11,

    # 대치 규칙 (초성)
    '전방화':   {'ㄱ':3,'ㄲ':4,'ㅋ':16,'ㅇ':2,'ㅎ':18},
    '치조음화': {'ㄱ':3,'ㄲ':4,'ㅋ':16},
    '후방화':   {'ㄷ':0,'ㄸ':1,'ㅌ':15,'ㄴ':2,'ㅂ':0,'ㅃ':1,'ㅍ':15},
    '연구개음화':{'ㄷ':0,'ㄸ':1,'ㅌ':15,'ㄴ':2},
    '경음화':   {'ㄱ':1,'ㄷ':4,'ㅂ':8,'ㅅ':10,'ㅈ':13,'ㅊ':13,'ㅋ':1,'ㅌ':4,'ㅍ':8},
    '기음화':   {'ㄱ':15,'ㄷ':16,'ㅂ':17,'ㅈ':14,'ㄲ':15,'ㄸ':16,'ㅃ':17,'ㅉ':14},
    '기음감소': {'ㅋ':0,'ㅌ':3,'ㅍ':7,'ㅊ':12},
    '비음화':   {'ㄱ':11,'ㄷ':2,'ㅂ':6,'ㄲ':11,'ㄸ':2,'ㅃ':6},
    '탈비음화': {'ㄴ':3,'ㅁ':7,'ㅇ':0},
    '파열음화': {'ㅅ':3,'ㅆ':3,'ㅈ':3,'ㅊ':3,'ㅎ':3,'ㄹ':3,'ㄴ':3,'ㅁ':7},
    '경음파열음화': {'ㅅ':4,'ㅆ':4},  # ㅅ→ㄸ
    '기음파열음화': {'ㅊ':16,'ㅉ':16},  # ㅊ→ㅌ (파찰음의 기음 파열음화)
    '마찰음화': {'ㄷ':9,'ㅌ':9,'ㄱ':9,'ㅂ':9,'ㅈ':9},
    '파찰음화': {'ㄱ':12,'ㄷ':12,'ㅂ':12,'ㅅ':12,'ㅌ':12},
    '유음화':   {'ㄴ':5,'ㄷ':5,'ㅁ':5,'ㄱ':5},
    '순음화':   {'ㄴ':6,'ㄷ':6,'ㄱ':6},
    '순음화동화':{'ㄴ':6,'ㄷ':6,'ㄱ':6},
    '비음화동화':{'ㄱ':11,'ㄷ':2,'ㅂ':6},
    '유음화동화':{'ㄴ':5},
    '연구개음화동화':{'ㄷ':0,'ㄴ':2},
    '치경음화동화':{'ㄱ':3,'ㅂ':3},
    '모음간첨가': None,  # 특수처리
}

JONG_RULES = {
    '탈락':       lambda j: 0,
    '종성탈락':   lambda j: 0,
    '겹받침단순화': lambda j: 1 if j in [3,5,6,9,10,11,12,13,14,15] else j,
    '비음화':     {'ㄱ':21,'ㄲ':21,'ㄷ':4,'ㅂ':16,'ㅅ':16,'ㅆ':16},
    '비음연구개화':{'ㄴ':21,'ㄷ':21},
    '비음순음화': {'ㄴ':16,'ㄷ':16},
    '전방화':     {'ㄱ':7,'ㄲ':7,'ㅋ':25},
    '유음화':     {'ㄴ':8,'ㄷ':8,'ㅁ':8},
    '파열음화':   {'ㄴ':4,'ㅁ':16,'ㅇ':21},  # 비음→파열(역)
    '후방화비음': {'ㄴ':21,'ㄷ':21,'ㅁ':21},
    '마찰음화':   {'ㄱ':19,'ㄷ':19},
}

def _match_rule(rules_dict, error_type, cho_or_jong, is_cho=True):
    """정확한 매칭 우선, 그 다음 부분 문자열 매칭 (긴 키 우선)"""
    # 1순위: 정확한 키 매칭
    if error_type in rules_dict:
        rule = rules_dict[error_type]
        if rule is None: return None
        sym = CHOSEONG[cho_or_jong] if is_cho else JONGSEONG[cho_or_jong]
        if callable(rule): return rule(cho_or_jong)
        if isinstance(rule, dict) and sym in rule: return rule[sym]
    # 2순위: 부분 포함 (긴 키 먼저)
    for key in sorted(rules_dict.keys(), key=len, reverse=True):
        if key != error_type and key in error_type:
            rule = rules_dict[key]
            if rule is None: return None
            sym = CHOSEONG[cho_or_jong] if is_cho else JONGSEONG[cho_or_jong]
            if callable(rule): return rule(cho_or_jong)
            if isinstance(rule, dict) and sym in rule: return rule[sym]
    return None

def apply_cho_rule(cho_idx, phoneme, error_type):
    if CHO_IDX.get(phoneme, -1) != cho_idx:
        return cho_idx
    result = _match_rule(CHO_RULES, error_type, cho_idx, is_cho=True)
    return result if result is not None else cho_idx

def apply_jong_rule(jong_idx, phoneme, error_type):
    if jong_idx == 0:
        return 0
    phoneme_jong_map = {
        'ㄱ':[1,2],'ㄴ':[4],'ㄷ':[7],'ㄹ':[8],'ㅁ':[16],
        'ㅂ':[17],'ㅅ':[19],'ㅆ':[20],'ㅇ':[21],'ㅈ':[22],
        'ㅊ':[23],'ㅋ':[24],'ㅌ':[25],'ㅍ':[26],'ㅎ':[27]
    }
    if jong_idx not in phoneme_jong_map.get(phoneme, []):
        return jong_idx
    result = _match_rule(JONG_RULES, error_type, jong_idx, is_cho=False)
    return result if result is not None else jong_idx

def transform(word, phoneme, position, error_type):
    result = list(word)
    changed = False
    syllables = [(i, decompose(c)) for i, c in enumerate(word)]
    valid = [(i, d) for i, d in syllables if d is not None]

    for idx, (i, (cho, jung, jong)) in enumerate(valid):
        if position in ('초성', '어중'):
            # 어중: 첫 음절 제외
            if position == '어중' and idx == 0:
                continue
            new_cho = apply_cho_rule(cho, phoneme, error_type)
            if new_cho != cho:
                result[i] = compose(new_cho, jung, jong)
                changed = True

        if position == '종성':
            new_jong = apply_jong_rule(jong, phoneme, error_type)
            if new_jong != jong:
                result[i] = compose(cho, jung, new_jong)
                changed = True

    output = ''.join(result)
    return output if changed and output != word else None

def get_word_candidates(phoneme, position):
    """패턴에 맞는 후보 단어 목록 반환"""
    candidates = []
    if position in ('초성',):
        candidates += WORDS_BY_CHO.get(phoneme, [])
        # 다른 음소 단어도 추가 (어두가 아닌 경우)
        for k, v in WORDS_BY_CHO.items():
            if k != phoneme:
                candidates += v[:20]  # 각 음소에서 20개씩
    elif position == '어중':
        candidates += WORDS_MEDIAL.get(phoneme, [])
        # 2음절 이상 단어에서 어중에 해당 음소 있는 것
        for k, v in WORDS_BY_CHO.items():
            candidates += v
    elif position == '종성':
        candidates += WORDS_BY_JONG.get(phoneme, [])
        for k, v in WORDS_BY_JONG.items():
            candidates += v[:15]

    # 모든 단어 포함 (중복 제거)
    all_words = []
    seen = set()
    for w in candidates:
        if w not in seen and len(w) >= 2:
            all_words.append(w)
            seen.add(w)
    return all_words

def get_training(phoneme, position, error_type, error_category, example_target, example_child):
    pos_label = {"초성":"말소리 앞부분","종성":"말소리 끝부분","어중":"단어 중간"}
    pos_str = pos_label.get(position, position)

    root_map = {
        '탈락': f"'{phoneme}'은(는) {pos_str}에서 조음 기관의 움직임이 완성되지 않아 소리가 생략됩니다. 아이의 조음 발달 과정에서 에너지가 많이 필요한 자음을 탈락시키는 것은 자연스러운 현상이지만, 지속될 경우 훈련이 필요합니다. 혀나 입술의 접촉 감각을 인식시키는 활동이 도움됩니다.",
        '전방화': f"'{phoneme}'(연구개음)을 혀 앞쪽(치경음)으로 발음합니다. '{example_target}'을 '{example_child}'처럼 발음하는 것이 대표적입니다. 혀 뒤쪽을 올려 연구개에 접촉하는 움직임이 아직 발달하지 않아 혀 앞쪽으로 대신합니다.",
        '후방화': f"'{phoneme}'(치경음)을 혀 뒤쪽(연구개음)으로 발음합니다. 혀 끝 조절 능력보다 혀 뒤쪽 움직임이 발달하여 나타나는 오류입니다. '{example_target}'을 '{example_child}'처럼 발음합니다.",
        '경음화': f"'{phoneme}'을 힘을 주어 된소리(경음)로 발음합니다. 조음 시 성대와 후두의 긴장도 조절이 어려워 과도한 힘이 들어갑니다. '{example_target}'을 '{example_child}'처럼 발음합니다.",
        '기음화': f"'{phoneme}'을 거센소리(기음)로 발음합니다. 기식음 조절 능력의 미성숙으로 과도한 기류가 방출됩니다. '{example_target}'을 '{example_child}'처럼 발음합니다.",
        '비음화': f"'{phoneme}'(구강음)을 비음으로 발음합니다. 연인두 폐쇄 기능이 완전히 발달하지 않아 기류가 비강으로 새는 현상입니다. '{example_target}'을 '{example_child}'처럼 발음합니다.",
        '파열음화': f"'{phoneme}'을 파열음으로 발음합니다. 마찰이나 파찰 소리보다 단순한 파열 패턴을 선호하는 발달적 특성입니다. '{example_target}'을 '{example_child}'처럼 발음합니다.",
        '마찰음화': f"'{phoneme}'을 마찰음으로 발음합니다. '{example_target}'을 '{example_child}'처럼 발음하는 오류입니다.",
        '파찰음화': f"'{phoneme}'을 파찰음으로 발음합니다. '{example_target}'을 '{example_child}'처럼 발음합니다.",
        '유음화': f"'{phoneme}'을 유음(ㄹ)으로 발음합니다. '{example_target}'을 '{example_child}'처럼 발음합니다.",
        '순음화': f"'{phoneme}'을 입술 소리(순음)로 발음합니다. '{example_target}'을 '{example_child}'처럼 발음합니다.",
        '동화': f"주변 소리의 영향을 받아 '{phoneme}'이 변형됩니다. '{example_target}'을 '{example_child}'처럼 발음하는 동화 현상입니다.",
    }
    root = f"이 오류 유형({error_type})은 아동 발달 과정에서 나타납니다. '{example_target}'을 '{example_child}'처럼 발음하는 패턴입니다."
    for key, tmpl in root_map.items():
        if key in error_type or key in error_category:
            root = tmpl
            break

    hint_map = {
        '탈락': f"'{phoneme}' 소리 크게 강조해서 들려주세요!",
        '전방화': f"혀 뒤를 올려서 '{example_target[0]}' 소리 내볼까?",
        '후방화': f"혀 끝으로 '{example_target[0]}' 소리 내볼까?",
        '경음화': f"살살 힘 빼고 '{example_target[0]}' 해볼까?",
        '기음화': f"바람 조금만 내고 '{example_target[0]}' 해볼까?",
        '비음화': f"입으로 소리 내볼까? '{example_target[0]}' 해봐!",
        '파열음화': f"'{phoneme}' 소리 잘 들어봐: {example_target}!",
        '유음화': f"혀 튕겨서 '{example_target[0]}' 소리 내볼까?",
        '동화': f"앞소리 먼저, 뒷소리 따로따로 말해볼까?",
    }
    hint = f"'{example_target}' 천천히 같이 말해볼까?"
    for key, tmpl in hint_map.items():
        if key in error_type or key in error_category:
            hint = tmpl
            break

    step1 = f"【1단계: 조음 감각 깨우기】거울 앞에서 '{phoneme}' 소리를 낼 때 혀와 입술 위치를 함께 관찰합니다. 아이가 부모의 입 모양을 따라 하도록 유도하며, 성공하면 크게 칭찬해 주세요. 소리를 들려주며 '이 소리가 뭔지 알아?' 하고 물어봐도 좋습니다."

    step2_map = {
        '탈락': f"【2단계: 소리 느끼기】손을 목에 가볍게 대고 '{phoneme}' 단독 소리를 내봅니다. '{phoneme}-아', '{phoneme}-오' 처럼 모음과 결합하여 반복 연습합니다. 진동 느낌을 몸으로 인식하게 해 주세요.",
        '전방화': f"【2단계: 소리 느끼기】혀 뒤쪽을 올리는 연습을 합니다. '카카카', '크크크'처럼 연구개음을 반복 연습합니다. 손가락으로 혀 앞쪽을 살짝 눌러 뒤로 가도록 유도할 수 있습니다.",
        '후방화': f"【2단계: 소리 느끼기】혀 끝을 앞 치아 뒤에 붙이는 연습을 합니다. '다다다', '따따따'처럼 치경음을 반복 연습합니다.",
        '비음화': f"【2단계: 소리 느끼기】코를 살짝 막고 목표 소리를 내보게 합니다. 코 막을 때와 뚫을 때 소리 차이를 느끼게 해 주세요.",
        '경음화': f"【2단계: 소리 느끼기】부드럽게 소리 내는 연습을 합니다. 촛불을 살살 불 듯 가볍게 내뱉으며 연습합니다.",
    }
    step2 = f"【2단계: 소리 느끼기】'{phoneme}' 소리를 단독으로 여러 번 반복합니다. 목표 소리와 오류 소리를 번갈아 들려주어 차이를 인식하게 합니다."
    for key, tmpl in step2_map.items():
        if key in error_type:
            step2 = tmpl
            break

    step3 = f"【3단계: 음절/단어로 연결하기】'{phoneme}'+모음 결합(예: {phoneme}아, {phoneme}이, {phoneme}우)으로 연습합니다. 이후 '{example_target}' 같은 쉬운 단어부터 시작합니다. 천천히, 크게, 과장되게 발음하여 성공 경험을 쌓습니다."
    step4 = f"【4단계: 일상에서 적용하기】그림책을 읽으며 목표 소리가 들어간 단어를 찾아봅니다. 일상 대화에서 자연스럽게 목표 단어를 사용합니다. 아이가 스스로 올바르게 발음하면 즉각 칭찬하고 오류 시 부드럽게 모델링해 주세요."

    rec_words_map = {
        'ㄱ':["가방","고양이","구름","기린","공","거울","과자","그림","강아지","개미"],
        'ㄴ':["나비","나무","눈","노래","나이","내일","냄비","너구리","느낌","낙엽"],
        'ㄷ':["다리","달","도토리","두부","다람쥐","당근","동생","드래곤","딸기","단추"],
        'ㄹ':["라면","리본","로봇","라디오","레몬","램프","리모컨","나라","고래","소리"],
        'ㅁ':["모자","마루","물","미소","말","메뚜기","멜론","모기","만두","망아지"],
        'ㅂ':["바나나","버섯","비행기","배","볼","봄","부채","벌","발","방석"],
        'ㅅ':["사과","사자","소","수박","새","선물","신발","시소","산","상어"],
        'ㅇ':["아기","아빠","엄마","우산","오리","야구","얼굴","유치원","의자","원숭이"],
        'ㅈ':["자동차","자전거","지도","종이","주스","장갑","전화","젓가락","지우개","진주"],
        'ㅊ':["책","친구","치마","침대","치즈","철봉","천사","책상","참새","칫솔"],
        'ㅋ':["코끼리","카메라","코알라","캥거루","커피","크레파스","컵","케이크","코","콩"],
        'ㅌ':["토끼","태양","타조","튤립","토마토","탁구","탑","테이블","통","틈"],
        'ㅍ':["피아노","피자","파란색","팔찌","풍선","팔","파리","포도","편지","펭귄"],
        'ㅎ':["하마","호랑이","하늘","해바라기","호박","화분","햇빛","흰색","황새","한복"],
    }
    rec = rec_words_map.get(phoneme, ["가방","나비","다리","라면","모자","바나나","사과","아기","자동차","코끼리"])

    return {"parentHint":hint,"rootCause":root,"trainingStep1":step1,
            "trainingStep2":step2,"trainingStep3":step3,"trainingStep4":step4,
            "recommendedWords":rec}

def generate_pairs(phoneme, position, error_type, error_category, example_target, example_child, count=PAIRS_PER_PATTERN):
    pairs = [{"targetWord": example_target, "childPronunciation": example_child}]
    seen_targets = {example_target}
    seen_children = {example_child}

    candidates = get_word_candidates(phoneme, position)

    for word in candidates:
        if len(pairs) >= count:
            break
        if word in seen_targets:
            continue
        child = transform(word, phoneme, position, error_type)
        if child and child != word and child not in seen_children:
            pairs.append({"targetWord": word, "childPronunciation": child})
            seen_targets.add(word)
            seen_children.add(child)

    return pairs

def escape_sql(s):
    return str(s).replace("'", "''")

def run_query(sql):
    payload = json.dumps({"query": sql})
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        f.write(payload)
        fname = f.name
    try:
        result = subprocess.run(
            ['curl', '-s', '-X', 'POST', URL,
             '-H', f'Authorization: Bearer {PAT}',
             '-H', 'Content-Type: application/json',
             '-d', f'@{fname}'],
            capture_output=True, text=True, timeout=60
        )
        resp = result.stdout.strip()
        try:
            return json.loads(resp)
        except:
            return {"raw": resp}
    finally:
        os.unlink(fname)

def main():
    with open(os.path.join(os.path.dirname(__file__), 'phoneme-combinations.json')) as f:
        patterns = json.load(f)

    print(f"총 {len(patterns)}개 패턴, 패턴당 최대 {PAIRS_PER_PATTERN}쌍\n")

    template_ok = template_skip = pairs_ok = 0
    errors = []
    BATCH = 8

    for batch_start in range(0, len(patterns), BATCH):
        batch = patterns[batch_start:batch_start+BATCH]
        end = min(batch_start+BATCH, len(patterns))
        print(f"  [{batch_start+1}~{end}/{len(patterns)}] ", end='', flush=True)

        # ── PhonemeTemplate upsert ──────────────────────────────────────────
        tpl_vals = []
        for p in batch:
            t = get_full_training(p['phoneme'], p['position'], p['errorType'],
                                  p['errorCategory'], p['exampleTarget'], p['exampleChild'])
            rw = json.dumps(t['recommendedWords'], ensure_ascii=False)
            tpl_vals.append(
                f"(gen_random_uuid()::text,"
                f"'{escape_sql(p['phoneme'])}','{escape_sql(p['position'])}',"
                f"'{escape_sql(p['errorType'])}','{escape_sql(p['errorCategory'])}',"
                f"'{escape_sql(p['exampleTarget'])}','{escape_sql(p['exampleChild'])}',"
                f"'{escape_sql(t['parentHint'])}','{escape_sql(t['rootCause'])}',"
                f"'{escape_sql(t['trainingStep1'])}','{escape_sql(t['trainingStep2'])}',"
                f"'{escape_sql(t['trainingStep3'])}','{escape_sql(t['trainingStep4'])}',"
                f"'{escape_sql(rw)}',NOW())"
            )

        tpl_sql = (
            'INSERT INTO "PhonemeTemplate" (id,phoneme,position,"errorType","errorCategory",'
            '"exampleTarget","exampleChild","parentHint","rootCause","trainingStep1",'
            '"trainingStep2","trainingStep3","trainingStep4","recommendedWords","generatedAt") '
            f'VALUES {",".join(tpl_vals)} '
            'ON CONFLICT (phoneme,position,"errorType") DO UPDATE SET '
            '"rootCause"=EXCLUDED."rootCause",'
            '"trainingStep1"=EXCLUDED."trainingStep1",'
            '"trainingStep2"=EXCLUDED."trainingStep2",'
            '"trainingStep3"=EXCLUDED."trainingStep3",'
            '"trainingStep4"=EXCLUDED."trainingStep4",'
            '"parentHint"=EXCLUDED."parentHint",'
            '"recommendedWords"=EXCLUDED."recommendedWords";'
        )
        resp = run_query(tpl_sql)
        if 'message' in resp:
            errors.append(f"TPL {batch_start}: {resp['message'][:80]}")
            template_skip += len(batch)
        else:
            template_ok += len(batch)

        # ── WordPairCache upsert ────────────────────────────────────────────
        pair_vals = []
        for p in batch:
            t = get_full_training(p['phoneme'], p['position'], p['errorType'],
                                  p['errorCategory'], p['exampleTarget'], p['exampleChild'])
            rw = json.dumps(t['recommendedWords'], ensure_ascii=False)
            pairs = generate_pairs(p['phoneme'], p['position'], p['errorType'],
                                   p['errorCategory'], p['exampleTarget'], p['exampleChild'])

            for pr in pairs:
                pair_vals.append(
                    f"(gen_random_uuid()::text,"
                    f"'{escape_sql(pr['targetWord'])}','{escape_sql(pr['childPronunciation'])}',"
                    f"'{escape_sql(p['errorType'])}','{escape_sql(p['errorCategory'])}',"
                    f"'{escape_sql(t['rootCause'])}','{escape_sql(t['trainingStep1'])}',"
                    f"'{escape_sql(t['trainingStep2'])}','{escape_sql(t['trainingStep3'])}',"
                    f"'{escape_sql(t['trainingStep4'])}','{escape_sql(rw)}',"
                    f"'{escape_sql(t['parentHint'])}',0,NOW(),NOW())"
                )

        if pair_vals:
            pair_sql = (
                'INSERT INTO "WordPairCache" (id,"targetWord","childPronunciation",'
                '"errorType","errorCategory","rootCause","trainingStep1","trainingStep2",'
                '"trainingStep3","trainingStep4","recommendedWords","parentMessage",'
                '"hitCount","createdAt","updatedAt") '
                f'VALUES {",".join(pair_vals)} '
                'ON CONFLICT ("targetWord","childPronunciation") DO NOTHING;'
            )
            resp = run_query(pair_sql)
            if 'message' in resp:
                errors.append(f"PAIR {batch_start}: {resp['message'][:80]}")
            else:
                pairs_ok += len(pair_vals)
            print(f"+{len(pair_vals)}쌍", flush=True)
        else:
            print("쌍없음", flush=True)

        time.sleep(0.2)

    print(f"\n{'='*55}")
    print(f"PhonemeTemplate: {template_ok}개 갱신, {template_skip}개 실패")
    print(f"WordPairCache: {pairs_ok}개 시도 (중복 제외 실제 삽입은 DB 확인)")
    if errors:
        print(f"\n오류 {len(errors)}개:")
        for e in errors[:5]: print(f"  {e}")
    print("완료!")

if __name__ == '__main__':
    main()
