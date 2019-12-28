declare namespace KKuTu{
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