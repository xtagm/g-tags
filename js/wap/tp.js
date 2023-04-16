/*jslint nomen: true, plusplus: true, regexp: true*/
/**
 * Tags Platform Strings
 */
var tps=
{
    name:'XTag Google Analytics',
    desc:'UA & GA4 Tags Recorder and Interpreter',
    credentials:'You need valid Google credentials to display charts', 
    copiedData:'Query Explorer data copied',  
    /**
     * Customization
     **/
    cta:"Event",
    title:{
        cta:"Show/Hide Event tags",
        other:"Show/Hide other tags (Display advertising, Timing, Transaction, Item, Custom...)",
        rowdata:"Copy data and open Query Explorer to import - Right Click to just copy",
        rowcopy:"Copy this tag",
        lastver:"Show GA4 tags only / UA & GA4 tags"       
    },
    clabel:{
        cta:"Events",
        lastver:"GA4 only"
    }         
};
/**
 * Tags Platform
 */
var tp=
{
    urls:["*://*.google-analytics.com/__utm.gif*","*://*.google-analytics.com/r*",
    "*://*.google-analytics.com/collect*",
	"*://*/j/collect*",
	"*://*/g/collect*",
    "*://stats.g.doubleclick.net/__utm.gif*", 
    "*://stats.g.doubleclick.net/collect*",
    "*://stats.g.doubleclick.net/r*"],

    setUser:function(user)
    {
        
    },
    /**
     * Retrieve current user 
     */     
    getUser:function()
    {
        return '';
    },
    /**
     * Ask if it is a request to capture 
     */    
    isRequest:function(rq)
    {
        return true;  
    },  
    /**
     * Init the platform 
     */      
    init:function()
    {
        /*
        trs.cta=tps.cta;
        trs.title.cta=tps.title.cta;
        trs.title.other+=tps.title.other;
        trs.clabel.cta=tps.clabel.cta;
        */
    },
    /**
     * Record parameters, initialize type
     */
    setParams : function(rq, params)
    {
        tm.type.params=params;
        tm.type.cta=((params.t==='event')||(params.utmt==='event'))||(params.en && params.en!=='page_view'); 
        tm.type.other=(!tm.type.cta&&((params.t && params.t!=='pageview')||(params.utmt && params.utmt!=='page'))) || (rq.url && rq.url.indexOf('stats.g.doubleclick.net') > 0);  
        tm.type.ua=params.tid?true:false; 
        tm.lastver = params.tid && (params.tid.indexOf("G-") == 0);          
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
        return false;//tm.type.cta;
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
     * Check credentials 
     */   
    checkCredentials : function(fnSuccess, fnFailure, user)
    {        
    },    
    /**
     * Online guide URL 
     */
    getBook : function()
    {
        return "";
    },
    /**
     * Get data query from list of request parameters
     */
    getDataQuery : function(url, params, purl)
    {
        var q='';
        return q;
    },
    /**
     * Link used to extract tag data 
     */       
     getDataLink:function()
     {
         return '';
     },
    /**
      * Return a name substitute in case of empty name
      */
     getEmptyNameSubstitute:function(type,url)
     {
         v='';
         return v;
     },
     /**
      * Return a splitter string (will be treated as &)
      */
     getUrlSplitter:function()
     {
        return 'richsstsse?';
     }
};

var tpse=
{
    'UA-000000-1':'Dummy example'  
};
