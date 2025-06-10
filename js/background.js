/**
 * @title Tags tracker - Background
 * @author DENIS ROUSSEAU
 * @version 4.0
 ******************************************************************************/
/*jslint nomen: true, plusplus: true, regexp: true*/
/**
 * Background manager
 */
var bps=
{
    url:
    {
        install : "option.html",
        update : "option.html"
    }
};
var wx=chrome||browser;
var bm=
{
    persist : wx.storage.local,
    currentWindow:
    {
        width : 0,
        height : 0
    },
    winid:null,//Id Tag Window
    timeoutID:null,
    loaded:null,
    charts:null,
    tabid : null,//Id Current tracked tab
    /**
     * Initialization
     */
    initTab:function(tab, fn)
    {
        if (!bm.isTabChild(tab))
        {
            bm.tabid=bm.isTabValid(tab)?tab.id:null ;
            if (fn)
            {
                fn();
            }
        }
    },    
    tabChanged : function(tid, fn)
    {
        wx.tabs.get(tid, function(tab) 
        {   
            bm.initTab(tab, fn);
        });        
    },
    reInit : function()
    {
       bm.resetControl();
       bm.loaded=null;
       bm.charts=null;
    },   
    isTabValid : function(tab)
    {
        if (tab !== undefined)
        {       
            if (tab.url !== undefined)
            {		
                return (tab.url.indexOf("https://chrome.google.com") !== 0 && tab.url.indexOf("chrome://") !== 0  && tab.url.indexOf("chrome-extension://") !== 0);
            }
        }
		return false ;
    },   
    isTabChild : function(tab)
    {
        if (tab !== undefined)
        {
            if (tab.url !== undefined && wx.runtime.id !== undefined)
            {
                return (tab.url.indexOf(wx.runtime.id)>0);
            }
        }
		return false ;
    },
    /**
     * Reset Control
     */
    resetControl : function()
    {
        wx.runtime.sendMessage({type: 'tc_disableView'});
    },             
    /**
     * Content calls
     */
    doEnableList : function()
    {
        bm.doEnableContent(bm.enableList);
    },    
    enableList : function()
    {
        wx.tabs.executeScript(bm.tabid, {code:'cc.enableList('+bm.tabid+')'}, 
        function(result)
        {
            var lastErr = chrome.runtime.lastError;
            if (lastErr) 
            {
                console.log('bm.enableList tab: ' + bm.tabid + ' lastError: ' + JSON.stringify(lastErr));
            }
        });
    },  
    disableList : function()
    {
        if (bm.tabid && bm.loaded)
        {
            wx.tabs.executeScript(bm.tabid, {code:'cc.disableList('+bm.tabid+')'}, function(result){
            var lastErr = chrome.runtime.lastError;
            if (lastErr) 
            {
                console.log('bm.disableList tab: ' + bm.tabid + ' lastError: ' + JSON.stringify(lastErr));
            }});
        }     
    },         
    doEnableViewChart : function()
    {        
        if (bm.tabid)
        {
            if (bm.charts===bm.tabid)
            {
                bm.doEnableView();
            }
            else
            {
                wx.tabs.sendMessage(bm.tabid, {type: 'cc_charts'}, function(response) 
                {
                    if (response)
                    {
                        bm.charts = response.status?bm.tabid:null;
                    }
                    if (bm.charts===bm.tabid)
                    {
                        bm.doEnableView();
                    }
                    else
                    {
                        bm.charts=bm.tabid;                            
                        wx.tabs.executeScript(bm.tabid, {file: "../js/lib/Chart.min.js" },function() 
                        {
                            wx.tabs.executeScript(bm.tabid, {file:'../js/ccomp/ch.js'}, bm.doEnableView);
                        });
                    }                  
                });
            }
        }
    },      
    /**
     * Content calls
     */
    doEnableContent : function(fn)
    {        
        if (bm.tabid)
        {
            if (bm.loaded===bm.tabid)         
            {
                fn();
            }
            else
            {
                wx.tabs.sendMessage(bm.tabid, {type: 'cc_loaded'}, function(response) 
                {
                    if (response)
                    {
                        bm.loaded = response.status?bm.tabid:null;                
                    }               
                    if (bm.loaded===bm.tabid)
                    {
                        fn() ;
                    }                
                    else
                    {
                        bm.loaded=bm.tabid;
                        wx.tabs.insertCSS(bm.tabid, {file:'../css/content.css'});
                        wx.tabs.executeScript(bm.tabid, {file:'../js/wap/ccomp/cp.js'},function()
                        {
                            wx.tabs.executeScript(bm.tabid, {file:'../js/ccomp/cc.js'}, fn);
                        });
                    }  
                });
            }
        }
    },     
    doEnableView : function()
    {        
        bm.doEnableContent(bm.enableView);
    },    
    enableView : function()
    {
        wx.tabs.executeScript(bm.tabid, {code:'cc.enableView('+bm.tabid+','+bm.charts+')'}, 
        function(result)
        {
            var lastErr = chrome.runtime.lastError;
            if (lastErr) 
            {
                console.log('bm.enableView tab: ' + bm.tabid + ' lastError: ' + JSON.stringify(lastErr));
            }
        });
    },
    disableView : function()
    {
        if (bm.tabid && bm.loaded)
        {
            wx.tabs.executeScript(bm.tabid, {code:'cc.disableView('+bm.tabid+')'}, function(result){
            var lastErr = chrome.runtime.lastError;
            if (lastErr) 
            {
                console.log('bm.disableView tab: ' + bm.tabid + ' lastError: ' + JSON.stringify(lastErr));
            }});
        }     
    },    
    onTabChanged : function(tabid)
    {
        bm.tabChanged(tabid, function()
        {
            bm.disableView() ;
            bm.resetControl();           
        });        
    },
    onSizeChanged : function()
    {
        if (bm.winid)
        {
            wx.windows.get(bm.winid, null, function(w)
            { 
                if (!wx.runtime.lastError && w) 
                {
                    bm.persist.set({'wTags':{'left':w.left,'top':w.top,'width':w.width,'height':w.height}});
                }
            });
        }
    },
    onPopup : function(tab)
    {
        bm.activate(tab);  
    },
    startHighligth :function()
    {
        if (!bm.timeoutID)
        {
            wx.windows.update(bm.winid, {"drawAttention":true});
        }        
    },
    stopHighlight : function()
    {
        bm.timeoutID=null;
        wx.windows.update(bm.winid, {"drawAttention":false});
    },
    createWindow : function(item)
    {
        chrome.windows.getCurrent({ populate: false }, (window) => {
            bm.currentWindow.width = window.width;
            bm.currentWindow.height = window.height;
        });
        var r=item.wTags||{'left':0,'top':bm.currentWindow.width-200,'width':bm.currentWindow.height,'height':200};
        wx.windows.create({url: "tags.html", type:"popup", left:(r.left||0), top:r.top, width:r.width, height:r.height}, 
        function(w)
        {
            bm.winid=w.id;
        });
    },
    activate:function(tab)
    {
        bm.tabid=bm.isTabValid(tab)?tab.id:null;    
        bm.persist.get('wTags', bm.createWindow);// initialize bm.winid
        wx.action.setIcon({path:{
        "16": "../img/16.png",
        "19": "../img/19.png",     
        "32": "../img/32.png",
        "38": "../img/38.png"     
        }});
        bm.loaded = false;        
    }
};
/*****************************************************************
 * Browser action listeners
 */
/**
 * Extension activation listener
*/
wx.action.onClicked.addListener(function(tab) 
{     
    wx.windows.getCurrent(function(win) 
    {
        if (bm.winid) 
        {
            wx.windows.update(bm.winid, {"focused":true}); 
        }
        else
        {       
            bm.activate(tab);
        }
    });
});

/*****************************************************************
 * Runtime listeners
 */
/**
 * Installation Listener (check whether new version is installed)
 */
if (wx.runtime.onInstalled)
{
	wx.runtime.onInstalled.addListener(function(details)
	{
        switch (details.reason)
        {
        case "install":
            if (bps.url[details.reason])
            {
                wx.tabs.create( {url: bps.url[details.reason]} );
            }
            break;
        case "update":
            wx.action.setPopup({popup:"popup.html"});
            break;
        }               
	});
}
/**
 * Message listener
 */
wx.runtime.onMessage.addListener(function(message, sender, sendResponse) 
{
    if (message)
    {    
        switch (message.type)
        {
        case 'bm_popup':
            wx.tabs.query({active:true},function(tabs)
            {
                if (tabs.length) 
                {
                    bm.onPopup(tabs[0]);
                }
            });
            wx.action.setPopup({popup:""});
            break;
        case 'bm_update':
            wx.tabs.create( {url: bps.url.update} );
            break;
        case 'bm_resize':
            bm.onSizeChanged();
            break;
        case 'bm_newtag':
            bm.startHighligth();
            break;
        case 'bm_focus':
            wx.windows.update(bm.winid, {"focused":true}); 
            break ;   
        case 'bm_enableList':   
            if (bm.tabid)
            {           
                bm.doEnableList() ;
            }
            else
            {
                bm.reInit();
            }                               
            break ;             
        case 'bm_enableView':   
            if (bm.tabid)
            {
                bm.charts=null;                
                bm.doEnableView() ;
            }
            else
            {
                bm.reInit();
            }                               
            break ;    
        case 'bm_enableViewChart':   
            if (bm.tabid)
            {
                bm.doEnableViewChart() ;
            }
            else
            {
                bm.reInit();
            }                               
            break ;                       
        case 'bm_disableView':       
            bm.disableView() ;                
            break ;
        case 'bm_focustab':
            wx.tabs.get(bm.tabid, function(tab) 
            {   
                wx.windows.update(tab.windowId, {"focused":true}); 
            });
            break;
        }
    }
});


/*****************************************************************
 * Windows listeners
 */
/**
 * Close Tag window listener
 */
wx.windows.onRemoved.addListener(function(windowId)
{
    if (windowId === bm.winid) 
    {
        bm.disableView() ;
        bm.tabid = null;
        bm.winid = null;                
        wx.action.setIcon(
        {
            path: 
            {
            "16": "../img/16bw.png",
            "19": "../img/19bw.png",       
            "32": "../img/32bw.png",
            "38": "../img/38bw.png"    
            } 
        }
        );
    }  
});
/**
 * Focus listener
 */
wx.windows.onFocusChanged.addListener(function(windowId)
{
   if (bm.winid && bm.winid!==windowId)
   {
        bm.onSizeChanged();   
        if (windowId && windowId!==-1)
        {   
            wx.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const tab = tabs[0];
            if (tab !== undefined)
				{
					if (tab.id!==bm.tabid)
					{
						bm.onTabChanged(tab.id);
					}
				}
            }); 
        }
   }    
});

/*****************************************************************
 * Tabs listeners
 */
/**
 * Tab activation listener
 */
wx.tabs.onActivated.addListener(function(activeInfo) 
{
    if (bm.tabid!==activeInfo.tabId && bm.winid && bm.winid!==activeInfo.windowId)
    {
        bm.onTabChanged(activeInfo.tabId);
    }   
});
/**
 * Tab removal listener
 */
wx.tabs.onRemoved.addListener(function(tabId) 
{
   if (bm.tabid === tabId)
   {
       bm.tabid=null;        
       bm.reInit();        
   }
});
/**
 * Tab load listener
 */
wx.tabs.onUpdated.addListener(function(tabid, changeInfo, tab) 
{
   if (changeInfo.status==='loading')
   {
       /* Current tab reload */
       if (bm.tabid === tabid)
       {
           bm.reInit();
       }
       /* New tab load */
       else if (!bm.tabid)
       {
           bm.tabChanged(tabid);
       }
    }
});

