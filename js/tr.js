/*jslint nomen: true, plusplus: true, regexp: true*/
/**
 * Tags resources strings 
 */
var trs=
{
    c:'en',
    
    page:"Page",
    cta:"Event",
    other:"Other",
       
    stop:"Stop recording",
    resume:"Resume recording",    
    copyDone:'# tags have been copied in the clipboard, you can paste in Excel.',
    copyDoneOne:'1 tag has been copied in the clipboard, you can paste in Excel.',
    badRequest:'Failed tag request copied in the clipboard (not recorded)',
    blockedRequest:'Tag request blocked, probably by an AdBlocker, copied in the clipboard (not recorded)',
    expand:"Click to expand control bar",
    rowDoubleClick:"Double click to show/hide all tag parameters",
    arrowClick:"Show/hide all tag parameters",
    rightClick:"Right click to copy this value",
    tagurl:"Reopen page - Right click to copy URL",
    copied:'Copied', 
    empty: '(empty: logged as url)', 
    clearConfirm: 'Do you really want to clear all recorded tags?',  
       
    title:{
        page:"Show/Hide Page tags",
        cta:"Show/Hide CTA tags",
        other:"Show/Hide other tags",
        url:"Show/Hide URL",
        details:"Show/Hide main details",
        advanced:"Show/Hide all tag parameters",  
        lastver:"Show only last version tags/All tags",  
        clear:"Clear all recorded tags",
        copy:"Copy all displayed tags with their query",
        copytsv:"Copy all displayed tag queries to TSV format with parameters in header and values in columns",
        chevron:"Collapse control bar",
        record:"Stop recording", 
        view:"(xtm/setm) In-Page CTA Spy",
        viewon:"Deactivate In-Page CTA Spy",
        list:"(xtm/setm - beta) CTA List",
        chart:"(xtm/setm) In-Page CTA Charts",
        dash:"Contextual Dashboard (granted users)",
        charton:"Deactivate In-Page CTA Charts",
        book:"Online guide",
        user:"User identification & settings (for CTA charts)",
        useron:"Close user settings without validation",
        apply:"Record user settings changes",
        rowchart:"CTA Chart",
        raise:"Activate raising for each tag",
        raiseon:"Stop raising"
    }, 
    clabel:{
        page:"Pages",
        cta:"CTA",
        other:"Others",
        url:"Page URL",
        details:"Details",
        advanced:"Advanced",
        filter:"External traffic only"
    }    
};
/**
 * Tags resources (bind objects and class names)
 */
var tr=
{
    /* Class Names */
    cnTag:"taghead",   
    cnType:"tagtype",
    cnPage:"typepage",
    cnCTA:"typecta",
    cnOther:"typeother", 
    cnSpace:"tagspace",
    cnSub:"tagsub",
    cnName:"tagname",
    cnUrl:"tagurl",
    cnTime:"tagtime",
    cnInfo:"info",
    cnDetail:"detail",
    cnCvar:"cvar",
    cnAdvanced:"advanced",   
    cnActive:"active",
    cnReduced:"reduced",
    cnView:"view",
    cnDLink:"dlink",
    cnLegacy:"tagLegacy",
    

    acbx:[],
    /**
     * Bind to HTML objects
     */
    init: function()
    {
        /* 
        * Nodes 
        * Important: all IDs must be lowercase and without their first letter below
        * ---------
        */
        var i=0, node=null, id='',title='';
        an=['cPage','cCTA','cOther','cUrl','cDetails','cAdvanced','cLastver','bList','bView','bRaise','bChart','bUser','bChevron','bCopy','bCopytsv','bBook','bClear','bApply','dRecord','dBar','dTags','dContent','dMsg',
            'dHelp','dUserContent','fUserForm','tEmail','tPwd','sPeriod','dOverlay','dBoxConfirm','tMsgConfirm','bConfirmYes','bConfirmNo'];
        for (i=0;i<an.length;i++)
        {
            id=an[i].substr(1).toLowerCase();
            node=id?document.getElementById(id):null;
            if (node)
            {
                if (an[i].charAt(0)==='c')
                {
                    node.nextSibling.nextSibling.innerHTML=tps.clabel[id]||trs.clabel[id]||'';
                    tr.acbx.push(node);
                    node.parentNode.title=tps.title[id]||trs.title[id]||'';
                }
                else
                {
                    title=tps.title[id]||trs.title[id]||'';
                    if (title)
                    {
                        node.title=title;
                    }
                }
                tr[an[i]]=node;
            }
        }
    }    
};

