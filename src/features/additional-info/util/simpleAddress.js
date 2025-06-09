const simpleAddress = (fullAddress) => {
  if (!fullAddress) return '';
  
  // 전처리: 불필요한 문자열 제거 및 정리
  let cleanedAddress = fullAddress
    .replace(/대한민국\s*/g, '') // "대한민국" 제거
    .replace(/\s*KR\s*/g, ' ') // "KR" 제거
    .replace(/South Korea\s*/g, '') // "South Korea" 제거
    .replace(/\s+/g, ' ') // 연속된 공백을 하나로
    .trim();
  
  // 중복된 지역명 제거 (예: "서울특별시 서울특별시" -> "서울특별시")
  const duplicatePatterns = [
    /(서울특별시)\s+\1/g,
    /(부산광역시)\s+\1/g,
    /(대구광역시)\s+\1/g,
    /(인천광역시)\s+\1/g,
    /(광주광역시)\s+\1/g,
    /(대전광역시)\s+\1/g,
    /(울산광역시)\s+\1/g,
    /(세종특별자치시)\s+\1/g,
    /(제주특별자치도)\s+\1/g,
    /([가-힣]+도)\s+\1/g
  ];
  
  duplicatePatterns.forEach(pattern => {
    cleanedAddress = cleanedAddress.replace(pattern, '$1');
  });
  
  // 한국 행정구역 패턴 (더 세분화된 단위까지)
  const patterns = [
    // 제주특별자치도 특별 처리
    /(제주특별자치도)\s*([^,\s]+시|[^,\s]+군)\s*([^,\s]+동|[^,\s]+읍|[^,\s]+면)(?=\s|$|[^가-힣])/,
    
    // 세종특별자치시 특별 처리
    /(세종특별자치시)\s*([^,\s]+읍|[^,\s]+면|[^,\s]+동)(?=\s|$|[^가-힣])/,
    
    // 일반 도 지역 (도 + 시/군 + 구/읍/면)
    /([^,\s]+도)\s*([^,\s]+시|[^,\s]+군)\s*([^,\s]+구|[^,\s]+읍|[^,\s]+면)(?=\s|$|[^가-힣])/,
    
    // 특별시/광역시 (시 + 구)
    /([^,\s]+특별시|[^,\s]+광역시)\s*([^,\s]+구|[^,\s]+군)(?=\s|$|[^가-힣])/,
    
    // 간단한 패턴들 (백업용)
    /([^,\s]+특별시|[^,\s]+광역시|[^,\s]+시|[^,\s]+도)\s*([^,\s]+구|[^,\s]+군|[^,\s]+시)(?=\s|$|[^가-힣])/,
    
    // 영문이 섞인 경우
    /([가-힣]+특별시|[가-힣]+광역시|[가-힣]+시|[가-힣]+도)\s*([가-힣]+시|[가-힣]+군|[가-힣]+구)\s*([가-힣]+구|[가-힣]+읍|[가-힣]+면|[가-힣]+동)/
  ];
  
  // 각 패턴을 순차적으로 시도
  for (const pattern of patterns) {
    const match = cleanedAddress.match(pattern);
    if (match) {
      const [, level1, level2, level3] = match;
      
      // 제주특별자치도의 특별 처리 (시/군 + 읍/면/동까지)
      if (level1 === '제주특별자치도') {
        if (level3) {
          return `${level1.trim()} ${level2.trim()} ${level3.trim()}`;
        }
        return level2 ? `${level1.trim()} ${level2.trim()}` : level1.trim();
      }
      
      // 세종특별자치시의 특별 처리 (읍/면/동까지)
      if (level1 === '세종특별자치시') {
        return level2 ? `${level1.trim()} ${level2.trim()}` : level1.trim();
      }
      
      // 일반 도 지역 (도 + 시/군 + 구/읍/면)
      if (level1.includes('도') && !level1.includes('제주')) {
        if (level3) {
          return `${level1.trim()} ${level2.trim()} ${level3.trim()}`;
        }
        if (level2) {
          return `${level1.trim()} ${level2.trim()}`;
        }
      }
      
      // 특별시/광역시 지역 (시 + 구)
      if (level1.includes('특별시') || level1.includes('광역시')) {
        if (level2) {
          return `${level1.trim()} ${level2.trim()}`;
        }
      }
      
      return level1.trim();
    }
  }
  
  // 추가적인 특별 패턴들 (정리된 주소에서)
  const additionalPatterns = [
    // "제주시 연동" -> "제주특별자치도 제주시 연동"
    /^(제주시|서귀포시)\s*([^,\s]+동|[^,\s]+읍|[^,\s]+면)/,
    
    // "서울 강남구" -> "서울 강남구"
    /^(서울|부산|대구|인천|광주|대전|울산)\s*([^,\s]+구|[^,\s]+군)/,
    
    // 일반적인 "시 구/군" 패턴
    /^([^,\s]+시)\s*([^,\s]+구|[^,\s]+군)/
  ];
  
  for (const pattern of additionalPatterns) {
    const match = cleanedAddress.match(pattern);
    if (match) {
      const [, part1, part2] = match;
      
      // 제주시/서귀포시의 경우 동/읍/면까지 포함
      if (part1 === '제주시' || part1 === '서귀포시') {
        return part2 ? `제주특별자치도 ${part1.trim()} ${part2.trim()}` : `제주특별자치도 ${part1.trim()}`;
      }
      
      return `${part1.trim()} ${part2.trim()}`;
    }
  }
  
  // 모든 패턴이 실패하면 원본 주소의 앞 세 단어만 반환 (한글만)
  const koreanWords = cleanedAddress.split(/[\s,]+/)
    .filter(word => /[가-힣]/.test(word) && word.length > 0);
  
  if (koreanWords.length >= 3) {
    return `${koreanWords[0]} ${koreanWords[1]} ${koreanWords[2]}`;
  } else if (koreanWords.length >= 2) {
    return `${koreanWords[0]} ${koreanWords[1]}`;
  } else if (koreanWords.length >= 1) {
    return koreanWords[0];
  }
  
  return fullAddress; // 최후의 수단
};

export default simpleAddress;