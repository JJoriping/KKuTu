declare namespace KKuTu{
  /**
   * 사용자가 설정 대화상자에서 설정하는 정보 객체.
   */
  type ClientSettings = {
    /**
     * 배경 음악 음소거 여부.
     */
    'mb': boolean,
    /**
     * 효과음 음소거 여부.
     */
    'me': boolean,
    /**
     * 초대 거부 여부.
     */
    'di': boolean,
    /**
     * 귓속말 거부 여부.
     */
    'dw': boolean,
    /**
     * 친구 요청 거부 여부.
     */
    'df': boolean,
    /**
     * 자동 준비 여부.
     */
    'ar': boolean,
    /**
     * 접속자 목록 정렬 여부.
     */
    'su': boolean,
    /**
     * 대기 중인 방만 보기 여부.
     */
    'ow': boolean,
    /**
     * 열려 있는 방만 보기 여부.
     */
    'ou': boolean
  };
  type ServerList = {
    'list': number[],
    'max': number
  };
  namespace Packet{
    type Type = keyof KKuTu.Packet.RequestTable
      | keyof KKuTu.Packet.ResponseTable
    ;
    type RequestData<T extends KKuTu.Packet.Type> = {
      'type'?: T
    }&KKuTu.Packet.RequestTable[T];
    type ResponseData<T extends KKuTu.Packet.Type> = {
      'type'?: T
    }&KKuTu.Packet.ResponseTable[T];
    /**
     * 요청(외부 → 게임 서버) 메시지를 유형별로 처리하는 핸들러 객체.
     */
    type RequestHandlerTable = {
      [key in KKuTu.Packet.Type]?: (data:KKuTu.Packet.RequestData<key>) => void
    };
    /**
     * 응답(게임 서버 → 외부) 메시지를 유형별로 처리하는 핸들러 객체.
     */
    type ResponseHandlerTable = {
      [key in KKuTu.Packet.Type]?: (data:KKuTu.Packet.ResponseData<key>) => void
    };

    type RequestTable = {
      'seek': {},
      'welcome': never
    };
    type ResponseTable = {
      'seek': {
        'value': number
      },
      'welcome': {
        'administrator': boolean
      }
    };
  }
}
