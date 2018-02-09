/*jslint nomen: true, plusplus: true, regexp: true*/
/**
 * Tags Platform Strings
 */
var tps=
{
    name:'G-Tags',
    desc:'Google Analytics tags tracker By Schneider Electric',    
    /**
     * Customization
     **/
    cta:"Event",
    title:{
        cta:"Show/Hide Event tags",
        other:" (Display advertising, Timing, Transaction, Item, Custom...)"
    },
    clabel:{
        cta:"Events"
    }         
};
/**
 * Tags Platform
 */
var tp=
{
    urls:["*://*.google-analytics.com/__utm.gif*",
    "*://*.google-analytics.com/r*",
    "*://*.google-analytics.com/collect*",
    "*://stats.g.doubleclick.net/__utm.gif*",
    "*://stats.g.doubleclick.net/collect*",
    "*://stats.g.doubleclick.net/r*"],

    setUser:function(user)
    {
        
    },
    getUser:function()
    {
        return '';
    },
    isRequest:function(rq)
    {
        return true;  
    },    
    init:function()
    {
        trs.cta=tps.cta;
        trs.title.cta=tps.title.cta;
        trs.title.other+=tps.title.other;
        trs.clabel.cta=tps.clabel.cta;
    },
    /**
     * Record parameters, initialize type
     */
    setParams : function(rq, params)
    {
        tm.type.params=params;
        tm.type.cta=((params.t==='event')||(params.utmt==='event')); 
        tm.type.other=(!tm.type.cta&&((params.t && params.t!=='pageview')||(params.utmt && params.utmt!=='page')));  
        tm.type.ua=params.tid?true:false;              
    },
    /**
     * Test if a parameter is a custom variable
     */    
    isCvar : function(cv)
    {
        return (cv && cv.indexOf('cd')===0 && (parseInt(cv.substr(2),10)>0));
    },  
    /**
     * Ask if URL must be displayed on corresponding type 
     */
    isURL : function()
    {
        return true;
    },   
   /**
     * Ask if this type must display chart icon 
     */
    isTypeChart : function(val)
    {
        return tm.type.cta;
    },
   /**
     * Retrieve Tag Type label from identified value
     */    
    getTypeLabel : function(val)
    {        
        return tv.bold(val);        
    },    
   /**
     * Retrieve Space label
     */    
    getSpaceLabel : function(space)
    { 
        var s='-',as=space.split(s), 
        prop= ((as.length&&tm.type.ua)?(tv.bold(as[0])+s+as.slice(1).join(s)):space),
        label= tpse[space];
        return (prop+(label?(' ('+label+')'):''));   
    },
    /**
     * Retrieve Sub Space label
     */
    getSubLabel : function(space, sub)
    {
        return sub;
    },  
   /**
     * Retrieve custom variable label
     */
    getCvarLabel : function(space, cv, ap)
    {
        return tc.getKnownCvarLabel(space,cv,ap);
    },
    /**
     * Retrieve miscellaneous parameter label
     */    
    getParamLabel : function(param)
    {
        var label=(ts.param[param]||param), an=[],pl=param, i=0;
        if (label===param)
        {
            an=param.match(/[0-9]+/g);
            if (an && an.length)
            {
                for (i=0;i<an.length;i++)
                {
                    pl=pl.replace(an[i],'_I_');
                }
                label=ts.param[pl];
                if (label)
                {
                    for (i=0;i<an.length;i++)
                    {
                        label=label.replace('$'+i.toString(),an[i]);
                    }
                }
                else
                {
                    label=param;
                }                
            }
        }
        return tv.noBreak(label);         
    },
    /**
     * Online guide URL 
     */
    getBook : function()
    {
        return "";
    }       
};

var tpse=
{
    'UA-8189219-1':'Hub Resource Advisor',  
    'UA-8189219-4':'SE United Arab Emirates',  
    'UA-8189219-5':'SE Korea',  
    'UA-8189219-6':'Preview - SE United Kingdom',  
    'UA-8189219-8':'SE Corporate',   
    'UA-8189219-9':'SE Spain',  
    'UA-8189219-10':'SE Russia',  
    'UA-8189219-11':'Preview - SE Corporate',  
    'UA-8189219-12':'Preview - SE Russia',  
    'UA-8189219-13':'Preview - SE Spain',  
    'UA-8189219-14':'Preview - SE United States',  
    'UA-8189219-15':'Preview - Energy University',  
    'UA-8189219-16':'SE South Africa',  
    'UA-8189219-17':'Preview - SE South Africa',  
    'UA-8189219-18':'SE India',  
    'UA-8189219-19':'Preview - SE India',  
    'UA-8189219-20':'SE Greece',  
    'UA-8189219-21':'SE Brazil',  
    'UA-8189219-22':'SE Indonesia - EN',  
    'UA-8189219-23':'SE Sweden',  
    'UA-8189219-24':'SE Turkey',  
    'UA-8189219-25':'SE France',  
    'UA-8189219-26':'SE Poland',  
    'UA-8189219-27':'SE China CN',
    'UA-8189219-28':'SE China EN',
    'UA-8189219-29':'SE Indonesia - ID',
    'UA-7637623-2': 'SE United States',
    'UA-46644293-1': 'APC',
    'UA-2449534-1': 'SE United Kingdom',
    'UA-60277833-1': 'SE Norway'
};
