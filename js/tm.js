/**
 * Tags Model
 */
var tm=
{
    wx:window.chrome||window.browser,
    persist:(window.chrome||window.browser).storage.local,
    cache:{},
    spaces:{},
    last:'',
    type:
    {
        cta:false,
        other:false
    },  
    /**
     * Dichotomic search in known spaces
     */  
    findSpace : function(v,av)
    {
        var b=0,l=av.length,e=l?(l-1):0,o = Math.floor((e-b)/2),p=0,c=0,
        fVal=function(elt)
        {
            var an=[],ar=elt.split('-');
            an.push(parseInt(ar[0],10));
            an.push(parseInt(ar[ar.length-1],10));
            return an;
        },
        fCmp=function(an,v)
        {
            return (v<an[0])?1:((v>an[1])?-1:0);            
        };
        /* Compare first and last element */
        if (l)
        {
            c=fCmp(fVal(av[p]),v);
            if (!c){return b;}
            if (c>0){return -1;}
            c=fCmp(fVal(av[e]),v);
            if (!c){return e;}
            if (c<0){return -1;}
        }
        /* Dichotomic search, ended when offset becomes zero */
        while (o)
        {
            p=b+o;
            c=fCmp(fVal(av[p]),v);
            if (!c){return p;}
            if (c>0){e=p;}else{b=p;}
            o = Math.floor((e-b)/2);
        }
        return -1;        
    },
    
    setCurSpace:function(s) 
    {
        tm.last=s;
        if (typeof tm.spaces[tm.last]==='undefined')
        {
            tm.spaces[tm.last]=(tm.findSpace(parseInt(tm.last,10),ts.space.known)>=0);
        }        
    }, 
    getCurSpace:function() 
    {
        return tm.last;
    }    
};