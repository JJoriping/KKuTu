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

    type RequestTable = {
      'seek': {}
    };
    type ResponseTable = {
      'seek': {
        'value': number
      }
    };
  }
}