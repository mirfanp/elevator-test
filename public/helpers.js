function getDaysInMonth(month,year) {     
    if( typeof year == "undefined") year = 1999; // any non-leap-year works as default     
    var currmon = new Date(year,month),     
        nextmon = new Date(year,month+1);
    return Math.floor((nextmon.getTime()-currmon.getTime())/(24*3600*1000));
} 
function getDateTimeSince(target) { // target should be a Date object
    var now = new Date(), diff, yd, md, dd, hd, nd, sd, out = [];
    diff = Math.floor(now.getTime()-target.getTime()/1000);
    yd = now.getFullYear()-target.getFullYear();
    md = now.getMonth()-target.getMonth();
    dd = now.getDate()-target.getDate();
    hd = now.getHours()-target.getHours();
    nd = now.getMinutes()-target.getMinutes();
    sd = now.getSeconds()-target.getSeconds();
    if( md < 0) {yd--; md += 12;}
    if( dd < 0) {
        md--;
        dd += getDaysInMonth(now.getMonth()-1,now.getFullYear());
    }
    if( hd < 0) {dd--; hd += 24;}
    if( nd < 0) {hd--; nd += 60;}
    if( sd < 0) {nd--; sd += 60;}

    if( yd > 0) out.push( yd+" year"+(yd == 1 ? "" : "s"));
    if( md > 0) out.push( md+" month"+(md == 1 ? "" : "s"));
    if( dd > 0) out.push( dd+" day"+(dd == 1 ? "" : "s"));
    if( hd > 0) out.push( hd+" hour"+(hd == 1 ? "" : "s"));
    if( nd > 0) out.push( nd+" minute"+(nd == 1 ? "" : "s"));
    if( sd > 0) out.push( sd+" second"+(sd == 1 ? "" : "s"));
    return out.join(" ");
}
