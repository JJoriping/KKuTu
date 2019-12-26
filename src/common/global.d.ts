declare type ScheduleOptions = {
  /**
   * `true`인 경우 시작할 때 한 번 즉시 호출한다.
   */
  'callAtStart': boolean,
  /**
   * `true`인 경우 정시에 호출된다. 가령 1시간마다 호출하려는 경우
   * 시작 시점과는 관계 없이 0시 정각, 1시 정각, …에 맞추어 호출된다.
   */
  'punctual': boolean
};
declare type Table<T> = {
  [key in string]: T
};