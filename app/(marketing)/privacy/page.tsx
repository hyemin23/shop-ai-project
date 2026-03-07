import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "똑픽 개인정보처리방침",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 md:py-24">
      <h1 className="text-3xl font-bold tracking-tight">개인정보처리방침</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        시행일: 2026년 3월 6일
      </p>

      <div className="mt-10 space-y-10 text-sm leading-relaxed text-muted-foreground [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:font-medium [&_h3]:text-foreground [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-foreground [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2">
        <p>
          [회사명] (이하 &quot;회사&quot;)은(는) 개인정보보호법 제30조에 따라
          정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게
          처리할 수 있도록 하기 위하여 다음과 같이 개인정보처리방침을
          수립·공개합니다.
        </p>

        <section>
          <h2>제1조 (개인정보의 수집 항목 및 수집 방법)</h2>
          <div className="mt-3">
            <h3 className="mb-2">1. 수집 항목</h3>
            <table className="mt-2">
              <thead>
                <tr>
                  <th>구분</th>
                  <th>수집 항목</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>필수</td>
                  <td>
                    이메일 주소, 소셜 계정 식별자(카카오/Google), 프로필 이미지,
                    닉네임
                  </td>
                </tr>
                <tr>
                  <td>자동 수집</td>
                  <td>
                    서비스 이용 기록, 접속 IP, 접속 일시, 쿠키, 브라우저 정보,
                    기기 정보
                  </td>
                </tr>
                <tr>
                  <td>결제 시</td>
                  <td>
                    결제 수단 정보(카드번호 뒷자리), 결제 기록, 빌링키
                    (토스페이먼츠 보관)
                  </td>
                </tr>
              </tbody>
            </table>

            <h3 className="mt-4 mb-2">2. 수집 방법</h3>
            <ul>
              <li>소셜 로그인(카카오, Google)을 통한 자동 수집</li>
              <li>서비스 이용 과정에서의 자동 생성/수집</li>
              <li>결제 과정에서 토스페이먼츠를 통한 수집</li>
            </ul>
          </div>
        </section>

        <section>
          <h2>제2조 (개인정보의 수집 및 이용 목적)</h2>
          <ul className="mt-3">
            <li>회원 가입 및 관리: 회원 식별, 가입 의사 확인, 서비스 부정 이용 방지</li>
            <li>서비스 제공: AI 이미지 편집 서비스 제공, 이미지 저장 및 관리</li>
            <li>요금 결제: 토큰 충전 및 구독 결제 처리, 환불 처리</li>
            <li>고객 지원: 문의 처리, 공지사항 전달, 서비스 개선</li>
            <li>마케팅(선택 동의 시): 신규 기능 안내, 프로모션 정보 제공</li>
          </ul>
        </section>

        <section>
          <h2>제3조 (개인정보의 보유 및 이용 기간)</h2>
          <div className="mt-3">
            <p>
              회사는 개인정보 수집·이용 목적이 달성된 후에는 해당 정보를 지체 없이
              파기합니다. 다만, 관련 법령에 의해 보존할 필요가 있는 경우 아래와 같이
              보관합니다:
            </p>
            <table className="mt-3">
              <thead>
                <tr>
                  <th>보존 항목</th>
                  <th>보존 기간</th>
                  <th>근거 법령</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>계약 또는 청약 철회에 관한 기록</td>
                  <td>5년</td>
                  <td>전자상거래법</td>
                </tr>
                <tr>
                  <td>대금 결제 및 재화 등의 공급에 관한 기록</td>
                  <td>5년</td>
                  <td>전자상거래법</td>
                </tr>
                <tr>
                  <td>소비자 불만 또는 분쟁 처리에 관한 기록</td>
                  <td>3년</td>
                  <td>전자상거래법</td>
                </tr>
                <tr>
                  <td>접속에 관한 기록</td>
                  <td>3개월</td>
                  <td>통신비밀보호법</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2>제4조 (개인정보의 제3자 제공)</h2>
          <div className="mt-3">
            <p>
              회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만,
              아래의 경우에는 예외로 합니다:
            </p>
            <table className="mt-3">
              <thead>
                <tr>
                  <th>제공받는 자</th>
                  <th>제공 항목</th>
                  <th>제공 목적</th>
                  <th>보유 기간</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>토스페이먼츠</td>
                  <td>결제 정보</td>
                  <td>결제 처리 및 정기 결제 관리</td>
                  <td>결제 서비스 이용 종료 시까지</td>
                </tr>
              </tbody>
            </table>
            <ul className="mt-3">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의한 경우</li>
            </ul>
          </div>
        </section>

        <section>
          <h2>제5조 (개인정보의 파기)</h2>
          <ol className="mt-3">
            <li>
              회사는 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가
              불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.
            </li>
            <li>
              전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여
              삭제하며, 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각합니다.
            </li>
            <li>
              회원 탈퇴 시 프로필, 토큰 잔액, 동의 기록, 업로드 이미지 등
              개인정보는 즉시 파기합니다. 다만, 전자상거래법에 따라 결제 및
              거래 기록은 5년간 보관 후 파기합니다.
            </li>
          </ol>
        </section>

        <section>
          <h2>제6조 (정보주체의 권리·의무 및 행사 방법)</h2>
          <div className="mt-3">
            <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다:</p>
            <ul className="mt-2">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리 정지 요구</li>
            </ul>
            <p className="mt-3">
              권리 행사는 서비스 내 설정 또는 이메일([이메일 주소])을 통해 가능하며,
              회사는 지체 없이 조치하겠습니다.
            </p>
          </div>
        </section>

        <section>
          <h2>제7조 (쿠키의 사용)</h2>
          <ol className="mt-3">
            <li>
              회사는 이용자에게 개별적인 맞춤 서비스를 제공하기 위해 쿠키(Cookie)를
              사용합니다.
            </li>
            <li>
              쿠키는 인증 상태 유지, 서비스 이용 분석 등의 목적으로 사용됩니다.
            </li>
            <li>
              이용자는 웹 브라우저 설정을 통해 쿠키의 허용/차단을 선택할 수
              있습니다. 다만, 쿠키 저장을 거부할 경우 로그인이 필요한 일부 서비스
              이용이 제한될 수 있습니다.
            </li>
          </ol>
        </section>

        <section>
          <h2>제8조 (개인정보의 안전성 확보 조치)</h2>
          <p className="mt-3">
            회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:
          </p>
          <ul className="mt-2">
            <li>개인정보 접근 제한 및 권한 관리</li>
            <li>개인정보의 암호화 (전송 시 TLS/SSL, 저장 시 암호화)</li>
            <li>해킹 등에 대비한 기술적 대책</li>
            <li>개인정보 처리 직원의 최소화 및 교육</li>
          </ul>
        </section>

        <section>
          <h2>제9조 (개인정보 보호 책임자)</h2>
          <div className="mt-3 rounded-lg border bg-muted/30 p-6">
            <ul className="space-y-1 list-none pl-0">
              <li>성명: [담당자명]</li>
              <li>직책: [직책]</li>
              <li>이메일: [이메일 주소]</li>
              <li>전화: [전화번호]</li>
            </ul>
          </div>
        </section>

        <section>
          <h2>제10조 (권익침해 구제 방법)</h2>
          <p className="mt-3">
            개인정보 침해에 대한 신고·상담이 필요한 경우 아래 기관에 문의하실 수
            있습니다:
          </p>
          <ul className="mt-2">
            <li>개인정보침해 신고센터: (국번없이) 118</li>
            <li>개인정보 분쟁조정위원회: 1833-6972</li>
            <li>대검찰청 사이버수사과: (국번없이) 1301</li>
            <li>경찰청 사이버수사국: (국번없이) 182</li>
          </ul>
        </section>

        <section>
          <h2>제11조 (개인정보처리방침 변경)</h2>
          <p className="mt-3">
            이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경
            내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터
            서비스 내 공지를 통하여 고지할 것입니다.
          </p>
        </section>
      </div>
    </div>
  );
}
