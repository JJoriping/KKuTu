interface JQuery{
  bgColor(code:string):this;
  color(code:string):this;
  hotKey($target:JQuery, code:string):this;
}
interface JQueryStatic{
  cookie(key:string, value?:string):string|void;
}