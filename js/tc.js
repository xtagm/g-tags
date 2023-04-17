/******************************************************************************
 * @title Tags Controller
 * @author DENIS ROUSSEAU
 * @version 4.6
 ******************************************************************************/
/*jslint strict: false, plusplus: true, regexp: true, evil: true, continue: true, trailing: false, white: true*/
/**
 * Tags Controller
 */
var tc=
{
    state : {checks:{}, bar:true, raise:true},
    record : true,
    timeout : 0,
    timer : null,    
    rqdone : {},
    rqurl : [],
    lastParam:{p:'',v:''},
    view:false,
    chart:false,
    user:false,
    settings:{},
    /**
     * Parse URL parameters
     */
    getUrlParser : function(u)
    {
        var params={}, bmark='_additional_xtag_', additional = 0;
        var ab1=[], ab2=[], lb = null, index = "" ;
        var firstParam = tp.getBlockBeginParam? tp.getBlockBeginParam() : "" ;
        var firstValue = tp.getBlockBeginParamValueFirst? tp.getBlockBeginParamValueFirst() : "" ;
        var nFirstIndex = -1 ;
        if (tp.getBlockSectionMark)
        {
            u = u.replace(tp.getBlockSectionMark(), '');
        }
        if (tp.getBlockMark)
        {
            u = u.replace(tp.getBlockMark(), '&' + bmark + '=0&');
        }        
        // Collect all parameters, added by blocks in a first array
        u.replace(new RegExp("([^?=&]+)(=([^&]*))?", "g"), function(b, a, d, c)
        {
            a=a.toLowerCase();
            if (a == bmark)
            {
                if (lb && Object.keys(lb).length > 0)
                {
                    ab1.push(lb);
                }
                lb = null ;
                return ;
            }
            if (!lb || (firstParam.length > 0 && a == firstParam))
            {
                if (lb && Object.keys(lb).length > 0)
                {
                    ab1.push(lb);
                }
                lb = {};
            }
            if (c)
            {
                lb[a] = c;
            }
        });
        if (lb && Object.keys(lb).length > 0)
        {
            ab1.push(lb);
        }
        // Try to find the block that must be considered as first
        for (i=0;i<ab1.length && nFirstIndex < 0;i++)
        {
            if (i == 0)
            {
                ab2.push(ab1[i]);
            }
            else if (firstParam.length == 0)
            {
                break ;
            }
            else
            {           
                for (p in ab1[i])
                {
                    if (ab1[i].hasOwnProperty(p) && (p == firstParam && ab1[i][p] == firstValue))
                    {
                        ab2.push(ab1[i]);
                        nFirstIndex = i ;
                        break ;                      
                    }
                }
            }
        }
        // Add additional blocks in final array
        for (i=1;i<ab1.length;i++)
        {
            if (i !== nFirstIndex)
            {
                ab2.push(ab1[i]);
            }
        }  
        // Iterate all blocks to add params in returned object, with an index for additional blocks
        for (i=0;i<ab2.length;i++)
        {
            index = (i>1)? (" (" + (i-1).toString() + ")") : "";
            for (p in ab2[i])
            {
                if (ab2[i].hasOwnProperty(p))
                {
                    params[p+index] = ab2[i][p] ;                        
                }
            }        
        }             
        return params;
    },
    /**
     * Retrieve URL without protocol
     */
    getUrl : function(u)
    {
        return (/(?:https?:\/\/)?(.*)$/i.exec(u)[1]);
    }, 
    /**
     * Retrieve parameter title from description array or settings
     */    
    getParamContextLabel : function(ap)
    {
        return ((ap.length>1)?ap[1]:'')||((ap.length>0)?tp.getParamLabel(ap[0]):'');  
    },   
    /**
     * Retrieve parameter label for known space
     */
    getKnownCvarLabel : function(space, param, ap)
    {
        var known=tm.spaces[space],i=0;
        if (!ap && known)
        {
            ap=ts.detail.cvar.val[param];
        }        
        return (((ap && ap.length>0 && known)?ap[0]:'')||param);
    },  
    /**
     * Retrieve parameter label
     */
    getParamTip : function(param)
    {
        var label=tp.getParamLabel(param), ln= param.match(/\d+$/);
        if (label===param && ln)
        {
            label=ts.param[param.replace(ln[0],'_')];
            if (label)
            {
                // Add param index to common label, except for custom variables
                label+=tv.ssep+(tp.isCvar(param)? '':ln[0]);
            }
            else
            {
                label=param;
            }
        }
        return tv.noBreak(label);       
    },  
    /**
     * Built cell title
     */
    getTitle : function(param, action, label)
    {
        return ((label||tp.getParamLabel(param))+' ['+param+'] - '+action) ;
    }, 
    getContextTitle : function(ap, action)
    {
        return tc.getTitle(ap[0],action,tc.getParamContextLabel(ap)) ;
    },     
    /**
     * Retrieve space value
     */
    getSpaceValue : function(params, ap)
    {
        var v=params[ap[0]], cbs='';
        if (v)
        {
            params[ap[0]]=null;
            tm.setCurSpace(v);            
        }
        return ((v==='undefined')?'':v);      
    }, 
    /**
     * Retrieve Sub Space value
     */
    getSubValue : function(params, ap)
    {
        var v=params[ap[0]];
        if (v)
        {
            v=decodeURIComponent(v);
            params[ap[0]]=null;                              
        }
        return ((v==='undefined')?'':v);      
    },  
    /**
     * Retrieve parameter's translation
     */    
    getValueTrans: function(value, ap, space)
    {
        var i=0, av=[], v=value;
        if (value && ap && (!space || tm.spaces[space]))
        {
            for (i=0;i<ap.length;i++)
            {
                av=ap[i].split(':');
                if (av.length===2 && (av[0]==='*'||av[0]===value.toLowerCase()))
                {
                    v=((av[1].charAt(0)==='-')?(value+' - '+av[1].substr(1)):av[1]);
                    break;
                }
            }
        }
        return v;        
    },     
    /**
     * Retrieve parameter value and possibly its translation
     */
    getParamValue : function(params, ap, translate)
    {
        var v='',i=0,n=0,av=[],an=ap.length?ap[0].split('|'):[];
        tc.lastParam={'p':'','v':''};
        for (n=0; n<an.length;n++)
        {
            v=params[an[n]];
            if (v)
            {
                params[an[n]]=null;                
                try
                {
                    v=decodeURIComponent(v);                    
                }
                catch (err) {console.log('tc.getParamValue(..) '+v+' '+err.message);} 
                tc.lastParam={'p':an[n],'v':v};               
                if (translate || tm.spaces[tm.last])
                {
                    v=tc.getValueTrans(v,ap.slice(2));
                }
                break;  
            }
        }
        return ((v==='undefined')?'':v);      
    },
    
    /**
     * Retrieve checkbox stored value
     */
    getCheckSetting : function(k, defval)
    {
        var v=tc.state.checks[k];
        return (v?((v==='1')?true:false):defval);
    },
    /**
     * Retrieve tag content as tabulated text
     */
    getTagText : function(node, withQuery)
    {
        var row=tv.getTableRowHeads(node, '\t'), att=node.getAttribute('index'), index=att?parseInt(att,10):-1, url='',purl=null;
        row+=((index>=0 && index<tc.rqurl.length)?('\t'+decodeURIComponent(url=tc.rqurl[index])):'');
        if (withQuery && url)
        {
            purl=node.querySelector('.'+tr.cnUrl+ '>a');
            row+=('\t'+tp.getDataQuery(url, tc.getUrlParser(url), purl?purl.href:''));
        }
        return row;    
    },    
    /**
     * Recording status changed (manage record timer)
     */
    recordChanged : function()
    {
        if (tc.record && !tc.timer)
        {
            tc.timer=window.setInterval(tc.onTimer, 1000);
        }
        else if (tc.timer)
        {
            window.clearInterval(tc.timer);
            tc.timer=null;
        }
    },
    /**
     * Clic on record light
     */
    onClickRecord : function(e)
    {
        this.classList.toggle(tr.cnActive);
        tc.record=(this.className.indexOf(tr.cnActive)>=0);
        this.title=(tc.record? trs.stop:trs.resume); 
        tc.recordChanged();       
    },
    /**
     * Checkbox actions
     */
    allCheckChanged : function(cbx,selector,visibleStyle,emptyVisible,invert)
    {
        var checked = invert? !cbx.checked : cbx.checked;
        var an=document.querySelectorAll(selector), i=0, v=(checked?'1':'0'),nh=null, isAdv=(selector.indexOf(tr.cnAdvanced)>=0);
        for (i=0;i<an.length;i++)
        {
            an[i].style.display=(checked&&(emptyVisible||an[i].textContent.replace(/(^\s*)/g, "")))?(visibleStyle||"block"):tv.vNone;
            if (isAdv || an[i].style.display===tv.vNone)
            {
                nh=an[i].previousSibling;
                if (nh)
                {
                    if (nh.className && nh.className.indexOf(tr.cnTag)<0)
                    {
                        nh=nh.previousSibling;
                    }
                    if (nh.className && nh.className.indexOf(tr.cnTag)>=0)
                    {
                        tc.setNodeArrow(nh.querySelector('.arrow'), an[i].style.display!==tv.vNone);  
                    }              
                }

            }
            if (visibleStyle===tv.vRow && an[i].className.indexOf(tr.cnInfo)<0)
            {
                tc.toggleRow(an[i],checked);
            }
        }
        tc.state.checks[cbx.id]=(cbx.checked?'1':'0');
        tm.persist.set({'statechecks':tc.state.checks});
    },    
    typeCheckChanged : function(cbx, type)
    {
        tc.allCheckChanged(cbx, '.'+tr.cnTag+'.'+type, tv.vRow);
    },
    infosCheckChanged: function(cbx, root)
    {
        if (tr.cPage.checked)
        {
            tc.allCheckChanged(cbx, '.'+tr.cnPage+tc.getLastverSelectorFromState()+root, tv.vRow);        
        }
        if (tr.cCTA.checked)
        {
            tc.allCheckChanged(cbx, '.'+tr.cnCTA+tc.getLastverSelectorFromState()+root, tv.vRow);        
        }
        if (tr.cOther.checked)
        {
            tc.allCheckChanged(cbx, '.'+tr.cnOther+tc.getLastverSelectorFromState()+root, tv.vRow);        
        }           
    },  
    detailsCheckChanged : function(checked)
    {
        var cbx=tr.cAdvanced;
        if (!checked)
        {
            cbx.checked=false;
        }
        cbx.disabled=!checked; 
    },
    getLastverSelector : function()
    {
        return ':not(.'+tr.cnLegacy+')' ;
    },
    getLastverSelectorFromState : function()
    {
        return (tr.cLastver && tr.cLastver.checked)? tc.getLastverSelector(): '' ;
    },    
    /**
     * Checkbox events
     */    
    onCheckLastver : function()
    {
        var legacySelect = '.'+tr.cnLegacy ;
        // Hide / Show legacy tags
        tc.allCheckChanged(this, '.'+tr.cnTag+legacySelect, tv.vRow, false, true);
        // At this point, if unchecked, all legacy tags have been displayed: current filters must be re-applied
        if (this.checked)
        {
            if (!tr.cAdvanced.checked)
            {
                tc.onCheckAdvanced();
            } 
        }
        else
        {
            if (!tr.cPage.checked)
            {
                tc.typeCheckChanged(tr.cPage, tr.cnPage+legacySelect);
            }
            if (!tr.cCTA.checked)
            {
                tc.typeCheckChanged(tr.cCTA, tr.cnCTA+legacySelect);
            }
            if (!tr.cOther.checked)
            {
                tc.typeCheckChanged(tr.cOther, tr.cnOther+legacySelect);
            }
            if (tr.cAdvanced.checked)
            {
                tc.onCheckAdvanced();
            }    
        } 
    },
    onCheckPage : function()
    {
        tc.typeCheckChanged(tr.cPage, tr.cnPage+tc.getLastverSelectorFromState());
    },
    onCheckCTA: function(e)
    { 
        tc.typeCheckChanged(tr.cCTA, tr.cnCTA+tc.getLastverSelectorFromState());
    },    
    onCheckOther: function(e)
    {             
        tc.typeCheckChanged(tr.cOther, tr.cnOther+tc.getLastverSelectorFromState());
    },     
    onCheckDetails: function(e)
    {
        tc.infosCheckChanged(tr.cDetails,(tr.cDetails.checked?('.'+tr.cnInfo+'.'+tr.cnDetail):('.'+tr.cnInfo)));
        tc.detailsCheckChanged(tr.cDetails.checked);          
    }, 
    onCheckAdvanced: function(e)
    {
        tc.infosCheckChanged(tr.cAdvanced,'.'+tr.cnInfo+'.'+tr.cnAdvanced);
    }, 
    onCheckUrl: function(e)
    {
        tc.allCheckChanged(tr.cUrl, '.'+tr.cnUrl, tv.vCell, true);
    },       
    /**
     * Click on Raise
     */
    onClickRaise:function()
    {
        tc.toggleRaise();     
    },           
    /**
     * Clipoard copy event
     */
    onClickCopy : function(e)
    {
        var an=document.querySelectorAll('.'+tr.cnTag), i=0, s='', c=0;
        for (i=0;i<an.length;i++)
        {
            if (an[i].style.display===tv.vRow)
            {
                c++;
                s+=tc.getTagText(an[i], true)+'\r\n';
            }
        }
        if (s)
        {
            tm.wx.runtime.sendMessage({type: 'bm_copy', text: s});
            tc.showMsgBar((c===1)?trs.copyDoneOne:trs.copyDone.replace('#',c.toString()));
        }        
    },
    /**
     * Clear content event
     */
    onClickClear : function(e)
    {
        tr.dTags.innerHTML= "";
        tc.rqurl.length=0;
    },
    /**
     * Click on chevron event
     */
    onClickChevron : function(e)
    {
        tc.toggleBar(false);
        e.stopPropagation();
        return false;        
    },
    /**
     * Click on reduced bar header
     */
    onClickBar: function()
    {
        tc.toggleBar(true);
    },
    onDoubleClickBar: function()
    {
        tc.toggleBar(false);       
    },
    /**
     * Click on tag lister
     */
    onClickList:function()
    {
        setTimeout(function()
        {            
            tm.wx.runtime.sendMessage({type:'bm_enableList'});                
        },100);
    },    
    /**
     * Click on tag viewer
     */
    onClickView:function()
    {
        tc.toggleView();
    },
    /**
     * Click on tag+chart viewer
     */
    onClickChart:function()
    {
        if (!tc.chart && !tc.settings.email)
        {
            tc.showMsgBar(tps.credentials, tc.user?null:tc.toggleUser);
        }
        else
        {
            tc.toggleChart();
        }
    },  
    /**
     * Click on User
     */
    onClickUser:function()
    {
        tc.toggleUser(); 
        if (tc.user)
        {
            tm.persist.get('user', function(item)
            { 
                var user=item.user||{};
                tr.tEmail.value=user.email||'';
                tr.tPwd.value=user.pwd||''; 
                tr.sPeriod.value=user.period||tr.sPeriod.options[tr.sPeriod.selectedIndex].value;              
            });             
        }       
    },  
    /**
     * Submit User changes
     */
    onClickApply:function(evt)
    {         
        var user={email:tr.tEmail.value,pwd:tr.tPwd.value,period:tr.sPeriod.options[tr.sPeriod.selectedIndex].value};
        tc.settings=user; 
        if (user.email)
        {
            tp.checkCredentials(tc.onCredentials, tc.onCredentialsFailure, {email:user.email, pwd:user.pwd});
        }
        else
        {
            user.pwd='';
            tp.onCredentials({UserID:'empty'});
        } 
        return false;
    },  
    /**
     * Expand/Collapse row details
     */
    onClickArrow : function(e)
    {

        var n=this.parentNode;
        while (n && n.tagName!=='TR')
        {
            n=n.parentNode;
        }
        if (n && n.tagName=='TR')
        {
            tc.toggleRow(n);     
        }  
    },
    /**
     * Credentials validation
     */
    onCredentials:function(data)
    {
        if (data && data.UserID)
        {
            tm.persist.set({user:tc.settings});
            tm.wx.runtime.sendMessage({type:'cc_userSettings','user':tc.settings});   
            tp.setUser(tc.settings);
            tc.showMsgBar('User settings validated');            
            tc.toggleUser();            
        }
    }, 
    onCredentialsFailure:function(status)
    {
        if (status===401)
        {
            tc.showMsgBar('These are not valid credentials');
            tm.persist.get('user', function(item)
            {
                tc.settings=(typeof item.user==='object')?item.user:{};                  
            });            
        }
    },     
   /**
     * Page load event
     */
    onLoad : function()
    {
        /*
         * Initialisation from storage
         */
        tm.persist.get('statechecks', function(item)
        {
            tc.state.checks=item.statechecks||{};   
            tm.persist.get('statebar', function(item)
            {
                if (typeof item.statebar==='boolean')
                {
                    tc.state.bar=item.statebar;
                }
                tm.persist.get('stateraise', function(item)
                {
                    if (typeof item.stateraise==='boolean')
                    {
                        tc.state.raise=item.stateraise;
                    }                    
                    tm.persist.get('user', function(item)
                    {
                        if (typeof item.user==='object')
                        {
                            tc.settings=item.user;
                            tp.setUser(tc.settings);
                        }                    
                        tc.onLoadState();
                    });
                });
            });                      
        });
        /*
         * Right Double-click handler
         */
        document.body.oncontextmenu=function(e) 
        {
            tc.onClickRight(e);
            return false;
        };        
    },
    /**
     * Page load event
     */
    onLoadState : function()
    {
        var i=0, cev="click";
        tp.init();
        tr.init();
        document.title=tps.name+' | '+tps.desc;
        for (i=0;i<tr.acbx.length;i++)
        {
            tr.acbx[i].checked=tc.getCheckSetting(tr.acbx[i].id,tr.acbx[i].checked);
        }
        tc.detailsCheckChanged(tr.cDetails.checked);
        /*
         * Record led click 
         */
        tr.dRecord.addEventListener(cev, tc.onClickRecord);
        /*
         * Filters clicks
         */
        tr.cLastver.onchange = tc.onCheckLastver;
        tr.cPage.onchange = tc.onCheckPage;
        tr.cCTA.onchange = tc.onCheckCTA;
        tr.cOther.onchange = tc.onCheckOther;
        /*
         * Enhanced information clicks
         */
        tr.cUrl.onchange = tc.onCheckUrl;
        tr.cDetails.onchange = tc.onCheckDetails;
        tr.cAdvanced.onchange = tc.onCheckAdvanced;   
        /*
         * General commands
         */     
        tr.bChevron.addEventListener(cev, tc.onClickChevron);  
        if (tr.bBook)
        {
            tr.bBook.addEventListener(cev, tc.onClickBook);
        }
        tr.bCopy.addEventListener(cev, tc.onClickCopy);       
        tr.bClear.addEventListener(cev, tc.onClickClear); 
        /*
         * Viewers and user settings
         */
        if (tr.bList)
        {
            tr.bList.addEventListener(cev, tc.onClickList);
        }        
        if (tr.bView)
        {
            tr.bView.addEventListener(cev, tc.onClickView);
        }
        if (tr.bChart)
        {
            tr.bChart.addEventListener(cev, tc.onClickChart);
        }
        if (tr.bUser)
        {
            tr.bUser.addEventListener(cev, tc.onClickUser);
        }
        if (tr.bRaise)
        {
            tr.bRaise.addEventListener(cev, tc.onClickRaise);
        }        
        /*
         * User settings form
         */
        if (tr.fUserForm && tr.bApply)
        {                       
            tr.fUserForm.addEventListener(cev, function(e){e.preventDefault();});
            tr.bApply.addEventListener(cev, tc.onClickApply);
        }       
        tr.dBar.addEventListener(cev, tc.onClickBar);  
        tr.dBar.addEventListener('dblclick', tc.onDoubleClickBar); 

        if (!tc.state.bar)
        {
            setTimeout(function(){tc.toggleBar(false);}, 1000);
        }   
        setTimeout(function(){tc.toggleRaise(tc.state.raise);}, 10);

        tc.recordChanged(); 
    },
    /**
     * Resize event
     */
    onResize : function()
    {
        if (tc.timeout) 
        {
            clearTimeout(tc.timeout);
        }
        tc.timeout = setTimeout(function() 
        {
            tm.wx.runtime.sendMessage({type:'bm_resize'});
            tc.timeout = 0;
        }, 100);        
    },
    /**
     * Force arrow state
     */
    setNodeArrow : function(node, isExpand)
    {
        if (node)
        {
            if (isExpand) 
            {
                node.className = node.className.replace('right', 'down');                    
            } 
            else 
            {
                node.className = node.className.replace('down', 'right');
            }   
        }            
    },
    /**
     * Toggle control bar
     */
    toggleBar : function(isVisible)
    {
        var cVisible=(tr.dBar.className.indexOf(tr.cnReduced)<0);
        if (isVisible!==cVisible)
        {
            if (isVisible)
            {
                tc.rheight=tr.dBar.clientHeight;
                tr.dBar.classList.remove(tr.cnReduced);
                setTimeout(function()
                {
                    tr.dContent.scrollTop+=tr.dBar.clientHeight-tc.rheight+1;
                },300);
            }
            else
            {
                tr.dBar.classList.add(tr.cnReduced);
            }
            tr.dBar.title=(isVisible? '':trs.expand);
            tm.persist.set({'statebar':isVisible});
        }
    },
    toggleRow : function(row, forced)
    {
        var node=row.nextSibling, vis=true, f=(typeof forced==='boolean'), 
        toggle=function(n,vis,checked,forced)
        {
            vis=vis&&((n.style.display===tv.vNone)||checked)&&forced;
            n.style.display=(vis&&n.textContent.replace(/(^\s*)/g, ""))?tv.vRow:tv.vNone;
            return vis;
        };            
        if (node)
        {
            vis=toggle(node,vis,tr.cDetails.checked,(!f||(forced&&tr.cDetails.checked)));
            node=node.nextSibling;
            if (node)
            {
                vis=toggle(node,vis,false,(!f||(forced&&tr.cAdvanced.checked)));
            }
            tc.setNodeArrow(row.querySelector('.arrow'), vis);                      
        }
    },    
    /**
     * Enable/Disable tags viewer
     */
    toggleView : function(view)
    {
        if (tr.bView)
        {
            var state=(view===undefined)?!tc.view:view;        
            tr.bView.title=state?trs.title.viewon:trs.title.view;              
            if (state)
            {
                tr.bView.classList.add('cenable');            
                if (tc.chart)
                {
                    tc.toggleChart();
                }
                setTimeout(function()
                {
                    tc.view=true;                  
                    tm.wx.runtime.sendMessage({type:'bm_enableView'});                
                },100);
            }
            else
            {
                tr.bView.classList.remove('cenable');
                tc.view=false;              
                if (view===undefined)
                {
                    tm.wx.runtime.sendMessage({type:'bm_disableView'});
                }            
            }
        }
    },
   
    /**
     * Enable/Disable tags+chart viewer
     */
    toggleChart : function(chart, fn)
    {
        if (tr.bChart)
        {
            var state=(chart===undefined)?!tc.chart:chart;        
            tr.bChart.title=state?trs.title.charton:trs.title.chart;              
            if (state)
            {
                tr.bChart.classList.add('cenable');            
                if (tc.view)
                {
                    tc.toggleView();
                }
                setTimeout(function()
                {
                    tc.chart=true;
                    tm.wx.runtime.sendMessage({type:'bm_enableViewChart'});               
                },100);        
            }
            else
            {
                tr.bChart.classList.remove('cenable'); 
                tc.chart=false;  
                if (chart===undefined)
                {                
                    tm.wx.runtime.sendMessage({type:'bm_disableView'});                
                }             
            }
        }
    },  
    /**
     * Enable/Disable tags viewer
     */
    toggleUser : function(user)
    {
        if (tr.bUser)
        {
            if (tc.user || (user!==undefined && !user))
            {
                tr.bUser.classList.remove('cenable');
            }
            else
            {
                if (tc.chart){tc.toggleChart();}
                if (tc.view){tc.toggleView();}
                tr.bUser.classList.add('cenable');
            }
            if (user===undefined)
            {
                tr.dUserContent.style.display=tc.user?tv.vNone:tv.vBlock;
            }
            tc.user=(user===undefined)?!tc.user:user;
            tr.bUser.title=tc.user?trs.title.useron:trs.title.user;          
        }
    }, 
    /**
     * Enable/Disable tags raising
     */
    toggleRaise : function(forced)
    {        
        if (tr.bRaise)
        {
            var active=(typeof forced==='boolean')?forced:!tc.state.raise;
            if (active)
            {
                tr.bRaise.classList.add('cenable');
            }
            else
            {                
                tr.bRaise.classList.remove('cenable');
            }  
            tc.state.raise=active;
            tr.bRaise.title=tc.state.raise?trs.title.raiseon:trs.title.raise;  
            tm.persist.set({'stateraise':tc.state.raise});                     
        }
    },     
    /**
     * Copy current cell in clipboard
     */    
    copyCell : function(node)
    {
        var s=node.textContent;
        if (s)
        {
            tm.wx.runtime.sendMessage({type: 'bm_copy', text: s});
        }           
    },
    /**
     * Copy current tag in clipboard
     */
    copyTag : function(node)
    {
        var s=tc.getTagText(node, true);
        if (s)
        {
            tm.wx.runtime.sendMessage({type: 'bm_copy', text: s});
        }        
    },
    /**
     * Transient messages
     */      
    showMsgTag : function(node, msg, rnode, fnEnd)
    {
        tr.dMsg.innerHTML=msg;
        var rc = node.getBoundingClientRect(), rcm=tr.dMsg.getBoundingClientRect(), delay=2000, 
        x1=rc.right - rcm.right + rcm.left -1, x2=rnode?rnode.getBoundingClientRect().right+4:x1;
        tr.dMsg.style.top = rc.top.toString() + "px";
        tr.dMsg.style.left = (Math.min(x1,x2)).toString() + "px";              
        tr.dMsg.style.visibility="visible";
        tr.dMsg.style.opacity="1";
        setTimeout(tc.hideMsgTag, delay);
        if (fnEnd)
        {
            setTimeout(fnEnd, delay);
        }
    },      
    hideMsgTag : function()
    {
        tr.dMsg.style.opacity="0";
        tr.dMsg.style.visibility="hidden";
        tr.dMsg.innerHTML='';
    }, 
    showMsgBar : function(msg, fnEnd, noHide, myDelay)
    {
        tr.dHelp.innerHTML=msg;
        var rc = tr.bUser?tr.bUser.getBoundingClientRect():tr.cAdvanced.parentNode.getBoundingClientRect(), delay=(myDelay || 3000); 
        tr.dHelp.style.top = "0px";
        tr.dHelp.style.left = (rc.right+8).toString() + "px";              
        tr.dHelp.style.visibility="visible";
        tr.dHelp.style.opacity="1";
        if (noHide)
        {
            if (fnEnd)
            {
                setTimeout(fnEnd, 10);
            }            
        }
        else
        {
            setTimeout(tc.hideMsgBar, delay);
            if (fnEnd)
            {
                setTimeout(fnEnd, delay);
            }
        }
    }, 
    hideMsgBar : function()
    {
        tr.dHelp.style.opacity="0";
        tr.dHelp.style.visibility="hidden";
        tr.dHelp.innerHTML='';
    },
    /**
     * Double-click on tag event : toggle row advanced details
     */
    onDoubleClickTag : function(e)
    {                  
        if (window.getSelection)
        {
            window.getSelection().removeAllRanges();
        }
        tc.toggleRow(this);           
        e.preventDefault();
        e.stopPropagation();
        return false;
    },
    /**
     * Right click
     */
    onClickRight:function(e)
    {
        if (e.target.classList.contains(tr.cnDLink) || e.target.parentNode.classList.contains(tr.cnDLink))
        {
            tc.onClickRowData(e);
        }
        else if (e.target.tagName==='A')
        {
            tm.wx.runtime.sendMessage({type: 'bm_copy', text: e.target.href});
            tc.showMsgTag(e.target.parentNode, trs.copied);
        }
        else if (e.target.previousSibling)
        {       
            var s, r=null;
            if (window.getSelection)
            {
                s=window.getSelection();
                r=document.createRange();
                r.selectNodeContents(e.target);
                s.removeAllRanges();
                s.addRange(r);
            }
            if (r && r.toString().length>0)
            {
                tc.copyCell(e.target);
                tc.showMsgTag(e.target, trs.copied, r, function(){window.getSelection().removeAllRanges();});
            }
        }
    },    
    /**
     * Click on Online guide book
     */
    onClickBook:function(e)
    {
        var b=tp.getBook();
        if (b)
        {
            window.open(b);
        }
    },
    /**
     * Click on row data
     */
    onClickRowData:function(e)
    {
        var node=e.target.parentNode, nodeMsg=node, att='', index=-1, url='', s='', purl=null;
        while (node && ! node.classList.contains(tr.cnTag))
        {
            if (node.tagName==='TH')
            {
                nodeMsg=node;
            }
            node=node.parentNode;
        }
        if (node)
        {
            att=node.getAttribute('index');
            index=att?parseInt(att,10):-1;
            if (index>=0)
            {
                url=tc.rqurl[index];
                if (url)
                {
                    purl=node.querySelector('.'+tr.cnUrl+ '>a');
                    s=tp.getDataQuery(url, tc.getUrlParser(url), (purl?purl.href:''));
                    if (s)
                    {
                        tm.wx.runtime.sendMessage({type: 'bm_copy', text: s});
                        tc.showMsgTag(nodeMsg, tps.copiedData);                     
                    }
                }
            } 
        }
        return true;          
    },        
    /**
     * Click on row chart
     */
    onClickRowChart:function(e)
    {
        if (!tc.settings.email)
        {
            tc.showMsgBar(trs.credentials, tc.user?null:tc.toggleUser);
        }
        else
        {        
            var rc=e.target.getBoundingClientRect(), p=tv.getTableRowHeads(tv.getNodeTableRow(e.target), ';');
            p=tc.settings.period+';'+p;
            window.open("rchart.html?p="+encodeURIComponent(p)+'#'+tp.getUser(),
            "X-Tags Chart","width=350,height=200,titlebar=0,status=0,menubar=0,top="+window.screenY.toString()+",left="+(window.screenX+rc.left+rc.width+4).toString());
        }
    },
    /**
     * Click on row copy
     */
    onClickRowCopy:function(e)
    {
        var node=e.target.parentNode;
        while (node && ! node.classList.contains(tr.cnTag))
        {
            node=node.parentNode;
        }
        if (node)
        {
            tc.copyTag(node);
            tc.showMsgBar(trs.copyDoneOne);
        }
    },          
    /**
     * Request recording
     */
    addRequest : function(rq, tu)
    {
        if (!tc.rqdone[rq.requestId])
        {
            tc.rqdone[rq.requestId]={requestId:rq.requestId,tabId:rq.tabId,url:rq.url,timeStamp:rq.timeStamp,tabUrl:tu,done:false};
        }
    },
    isFiltered : function(v)
    {
        var i=0;
        for (i=0;i<ts.space.filtered.length;i++)
        {
            if (v===ts.space.filtered[i])
            {
                return true;
            }
        }
        return false;
    },
    /**
     * Tag Recording
     */
    addTag : function(rq)
    {       
        var node=null, icon=null, arrow=null, content='', i=0, c=0, cs=1, v='',param=null, params=null,isBr=true, ah=[], ap=[], scontent='',cn='',
        date=new Date(rq.timeStamp), index = 0, cmin=1,
        hdr=ts.header, tmt=tm.type, cnLegacy = '',
        visible=true, translate=false, ptrans=false,
        withUrl= tr.cUrl.checked, infos= tr.cDetails.checked, advanced=false, label='', tip='', val='', pv='';
        
        /* Mark request as done, store it, extract parameters, compute type and visibility */
        tc.rqdone[rq.requestId].done=true;
        index = tc.rqurl.push(rq.url)-1;
        params=tc.getUrlParser(rq.url.replace(/&amp;/g, '&'));
        tp.setParams(rq, params);
        if (!tm.lastver)
        {
            cnLegacy = " " + tr.cnLegacy ;
        }
        visible=((tmt.cta && tr.cCTA.checked) || (tmt.other && tr.cOther.checked) || (!tmt.cta && !tmt.other && tr.cPage.checked)) && (!tr.cLastver || !tr.cLastver.checked || tm.lastver);
        
        tc.detailsCheckChanged(infos);
        advanced= tr.cAdvanced.checked;    
        
        /* Header row **************************************************/
        
        /* Header row: Tag type column */   
        val=tc.getParamValue(params, (tmt.cta?hdr.type.cta:(tmt.other?hdr.type.other:hdr.type.page)), true)||(tmt.cta?trs.cta:(tmt.other?trs.other:trs.page));
        content+=tv.nodeHeaderCellType(tp.getTypeLabel(val), tr.cnType, (tc.lastParam.v?('['+tc.lastParam.p+'='+tc.lastParam.v+'] '):'')/*+trs.rowDoubleClick*/, 
                                       null, tp.isTypeChart(val), tp.getDataLink(tp.getDataQuery(rq.url, tc.getUrlParser(rq.url), rq.tabUrl)));
                
        /* Header row: space column (mandatory) */
        for (i=0,c=0;i<hdr.space.length;i++)
        {
            v=tc.getSpaceValue(params, hdr.space[i]);
            if (v)
            {
                /* Check filtered space */
                if (!tc.isFiltered(v))
                {
                    v=tp.getSpaceLabel(v);
                    content+=tv.nodeHeaderCell(v, tr.cnSpace, tc.getTitle(hdr.space[i][0], trs.rightClick));
                    c++;    
                }
                break;            
            }
        } 
        if (c===0 /*&& tmt.other*/)
        {
            return;
        }
        /* Header row: Ensure that space column has been created */
        if (c<1)
        {
            content+=tv.header;
            c++;
        }          
        /* Header row: Sub Space column */
        for (i=0;i<hdr.spsub.length;i++)
        {        
            v=tc.getSubValue(params, hdr.spsub[i]);
            if (v)
            {
                v=tp.getSubLabel(tm.last, v); 
                content+=tv.nodeHeaderCell(v, tr.cnSub, tc.getTitle(hdr.spsub[i][0], trs.rightClick));
                c++;
                break;
            }
        }       
        cmin+=(hdr.spsub.length?1:0);  
        /* Header row: Ensure that column has been created */
        if (c<cmin)
        {
            cs++;
            c++;
        }        
        /* Header row: Complement column, depending on tag type */
        ah = hdr.compl||[];
        for (i=0;i<ah.length;i++)
        {
            v=tc.getParamValue(params, ah[i], true);
            if (v)
            {
                content+=tv.nodeHeaderCell(v, tr.cnSub, tc.getContextTitle(ah[i],trs.rightClick));
                c++;
                break;
            }
        }     
        cmin+=(ah.length?1:0);  
        if (c<cmin)
        {
            cs++;
            c++;
        }                      
        /* Header row: Name column, depending on tag type */
        ah = ((tmt.cta)? hdr.name.cta:(tmt.other? hdr.name.other:hdr.name.page));
        for (i=0;i<ah.length;i++)
        {
            v=tc.getParamValue(params, ah[i], true);
            pv='';
            if (!v && tp.getEmptyNameSubstitute)
            {
                v=tp.getEmptyNameSubstitute(tmt, rq.tabUrl);
                pv=trs.empty+' ';
            }
            if (v)
            {
                // In case of & in name, only the part before will be taken into account
                v=v.split('&')[0];
                if (v)
                {
                    content+=tv.nodeHeaderCell(v, tr.cnName, pv+tc.getContextTitle(ah[i],trs.rightClick), '', cs);
                    cs=1;
                    c++;
                    break;
                }
            }
        }
        /* Header row: ensure that all columns have been created */
        if (c<(cmin+1))
        {
            content+=tv.nodeHeaderCellEmpty(cs);
        }            
        /* Header row: Page URL and Time columns */
        content+=tv.nodeHeaderCellUrl((tp.isURL()?tc.getUrl(rq.tabUrl):''), tr.cnUrl, trs.rightClick,(withUrl?tv.vCell:tv.vNone),rq.tabUrl, trs.tagurl);
        content+=tv.nodeHeaderCellTime(tv.noBreak(date.toLocaleTimeString()), tr.cnTime, trs.rightClick);
        
        /* Header row node creation */
        cn=(tmt.cta?tr.cnCTA:(tmt.other?tr.cnOther:tr.cnPage));
        node=tv.nodeRow(content, tr.cnTag+' '+cn+cnLegacy, visible, index);
        tr.dTags.appendChild(node);
        /* Double click listener */
        node.addEventListener('dblclick', tc.onDoubleClickTag);
        /* Click on Data link listener */
        icon=node.querySelector('.dlink');
        if (icon)
        {
            icon.title=tps.title.rowdata;
            icon.addEventListener('click', tc.onClickRowData);
        }               
        /* Click on Chart icon listener */
        icon=node.querySelector('.cchart');
        if (icon)
        {
            icon.title=trs.title.rowchart;
            icon.addEventListener('click', tc.onClickRowChart);
        }
        /* Click on Copy icon listener */
        icon=node.querySelector('.ccopy');
        if (icon)
        {
            icon.title=tps.title.rowcopy;
            icon.addEventListener('click', tc.onClickRowCopy);
        }  
        /* Click on arrow icon listener */
        arrow=node.querySelector('.arrow');
        if (arrow)
        {
            arrow.title=trs.arrowClick;
            arrow.addEventListener('click', tc.onClickArrow);
        }                  
                
        /* Details row **************************************************/
        
        /* Details row: identified parameters */
        for (i=0,c=0,content='';i<ts.detail.other.length;i++)
        {
            val=decodeURIComponent(params[ts.detail.other[i][0]]);
            v=tc.getParamValue(params, ts.detail.other[i], true);
            if (v)
            {
                label=tp.getParamLabel(ts.detail.other[i][0]);
                tip=((label===ts.detail.other[i][0])? tc.getParamTip(ts.detail.other[i][0]) : (ts.detail.other[i][0]+((v===val)?'':('='+val))));
                content+=tv.nodeParam(label, tip, v, (c===0));
                c++;
            }
        }       
        /* Details row: custom variables */
        for (i=0;i<ts.detail.cvar.max;i++)
        {            
            param=ts.detail.cvar.prefix+(i+1).toString();
            val=v=params[param];
            if (v)
            {
                params[param]=null;
                try
                {
                    val=v=decodeURIComponent(v);
                }
                catch (err1) 
                {
                    console.log('tc.addTag(..) custom variables:'+v+' '+err1.message);
                }   
            }     
            ap=ts.detail.cvar.val[param];    
            v=tc.getValueTrans(v, (ap?ap.slice(1):[]), tm.last);
            if (v)
            {
                label=tp.getCvarLabel(tm.last, param, ap);
                tip=tc.getParamTip(param) + (param+((v===val)?'':('='+val)));
                content+=tv.nodeParamCVar(label, tip, v, (c===0));
                c++;
            }
        } 
        node=tv.nodeRowDetail(content, cn+" "+tr.cnInfo+" "+tr.cnDetail+cnLegacy, (visible&&infos&&content), true);
        tr.dTags.appendChild(node);     
              
        /* Advanced row **************************************************/     

        /* Advanced row: all parameters still not identified */
        scontent='';
        for (param in params)
        {
            if (params.hasOwnProperty(param))
            {
                v=params[param];
                if (v)
                {
                    try
                    {
                        v=decodeURIComponent(v);
                    }
                    catch (err2) {console.log('tc.addTag(..) Advanced:'+v+' '+err2.message);}  
                    if (tp.getParamValue) 
                    {
                        v = tp.getParamValue(param, v) ;
                    }                                                       
                    scontent+=tv.nodeParam(param, tc.getParamTip(param), v, (c===0||isBr));
                    isBr=false;
                    c++;
                }                    
            }
        }    
        node=tv.nodeRowDetail(scontent, cn + " "+tr.cnInfo+" "+tr.cnAdvanced+cnLegacy, (visible&&advanced&&scontent), !content);
        tr.dTags.appendChild(node);   
        tc.setNodeArrow(arrow, (visible&&advanced&&scontent));
        
        /* All rows are created ******************************/
          
        /* Scroll to make new tag visible and draw attention */
        tr.dContent.scrollTop=tr.dContent.scrollHeight;
        if (visible)
        {
            tm.wx.runtime.sendMessage({type:'bm_newtag'});
            if (tc.state.raise)
            {
                tm.wx.runtime.sendMessage({type:'bm_focus'});
            }
        }    
    },
    /**
     * Timer callback
     */
    onTimer : function()
    {
        if (tc.record)
        {
            var sId='',sRq=null, now=new Date(), i=0, ar=[];
            for (sId in tc.rqdone)
            {
                if (tc.rqdone.hasOwnProperty(sId))
                {                    
                    /* Collect all recorded tags still not append when older than 1 second */
                    sRq=tc.rqdone[sId];
					if (sRq.done)
					{
						ar.push(sId);
					}
                    else if ((now-sRq.timeStamp)>1000)
                    {
						tc.addTag(sRq);
                    }
                }
            } 
            /* Add all collected tags */
            for (i=0;i<ar.length;i++)
            {
                delete tc.rqdone[ar[i]];
            } 
        }          
    }, 
    /**
     * Request catching events
     */   
    onBeforeRequest: function(details)
    {
        if (details.method==='POST' && tc.record)
        {
			if (details.requestBody.raw !== undefined)
			{
				var ad=details.requestBody.raw, p='', rq=details;
				if (ad.length>0)
				{
					p=new TextDecoder("utf-8").decode(ad[0].bytes);
					if (p)
					{
						rq.url+="?"+p;
						tm.wx.tabs.get(rq.tabId,function(Tab){tc.addRequest(rq, Tab.url);});
					}
				}
			}
        }
    },
    onSendHeaders : function(rq)
    {        
        if (tc.record)
        {
            /* When still not done, collect the request before any redirection */
            if (rq.tabId >=0 && !tc.rqdone[rq.requestId] && tp.isRequest(rq))
            {                
                tm.wx.tabs.get(rq.tabId,function(Tab){tc.addRequest(rq, Tab.url);});
            }
        }          
    },   
    onHeadersReceived : function(rq)
    {        
        if (tc.record)
        {
            var sId='',sRq=null;
            /* Consume before the recorded SendHeader on the same TabId */
            for (sId in tc.rqdone)
            {
                if (tc.rqdone.hasOwnProperty(sId) && sId!==rq.requestId)
                {                    
                    sRq=tc.rqdone[sId];
                    if (sRq && !sRq.done && sRq.tabId===rq.tabId)
                    {
						tc.addTag(sRq);
                        break;
                    }
                }
            }
            sRq=tc.rqdone[rq.requestId];
            if (sRq && !sRq.done)
            {
                /* Add tag when statusCode is success or redirected */
                if (rq.statusCode===200 || rq.statusCode===204 || rq.statusCode===302)
                {
					tc.addTag(sRq);
                }
                /* Bad request: log message */
                else
                {
					tc.onErrorOccurred(rq);
                }
            }
        }          
    },
    onErrorOccurred : function(rq)
    {        
        if (tc.record && (!rq.error || rq.error.indexOf('ERR_ABORTED')<0))
        {
            var sRq=tc.rqdone[rq.requestId], reason=rq.statusCode?rq.statusCode.toString():(rq.error||'');
            if (!sRq)
            {
                tc.addRequest(rq);
                sRq=tc.rqdone[rq.requestId];
            }
            if (sRq && !sRq.done)
            {
                tc.rqdone[rq.requestId].done=true;
                console.log(tps.name+" >> "+rq.url+" has returned: "+reason);
                chrome.runtime.sendMessage({type:'bm_copy', text:reason+'\t'+rq.url+'\r\n'});
                tm.wx.runtime.sendMessage({type:'bm_newtag'});
                tm.wx.runtime.sendMessage({type:'bm_focus'});
                tc.showMsgBar((reason && reason.indexOf("net::ERR_BLOCKED_BY_CLIENT")==0)? trs.blockedRequest : trs.badRequest, null, false, 4500);
            }
        }          
    },    
    onKeyDown : function(e)
    {
        if (tc.view || tc.chart)
        {
            if (e.keyCode === 27) 
            {
                if (tc.view){tc.toggleView();}
                if (tc.chart){tc.toggleChart();}
            } 
            else if (e.keyCode === 107)
            {
                tm.wx.runtime.sendMessage({type: 'tb.persist'});            
            }
        }
        return false;
    }    
};
/******************************************************************************
 * Listeners
 ******************************************************************************/
/**
 * Page load listener
 */
window.addEventListener("load", tc.onLoad);
/**
 * Resize listener
 */
window.addEventListener('resize', tc.onResize, false);
/**
 * Escape listener
 */
window.document.addEventListener("keydown", tc.onKeyDown);
/**
 * URL requests listener
 */
tm.wx.webRequest.onBeforeRequest.addListener(tc.onBeforeRequest, {urls:tp.urls},['requestBody']);
tm.wx.webRequest.onSendHeaders.addListener(tc.onSendHeaders, {urls:tp.urls});
tm.wx.webRequest.onHeadersReceived.addListener(tc.onHeadersReceived, {urls:tp.urls});
tm.wx.webRequest.onErrorOccurred.addListener(tc.onErrorOccurred, {urls:tp.urls});
/**
 * Custom events listener
 */
tm.wx.runtime.onMessage.addListener(function(request, sender, sendResponse) 
{
    switch (request.type)
    {
    /* 
     * Request to disable view mode
     */
    case 'tc_disableView':
        tc.toggleView(false);
        tc.toggleChart(false);
        sendResponse({status:true});
        break;
    /*
     * Request for current user settings
     */
    case 'tc_userSettings':
        if (tc.settings.email)
        {
            sendResponse({user:tc.settings, activate:request.activate});
        }
        else
        {
            if (!tc.user)
            {
                toggleUser();
            }
        } 
        break;   
    case 'tc_message':
        if (request.text)
        {
            tc.showMsgBar(request.text, null, request.nohide);
        }
        break;     
    }
});



