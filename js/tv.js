/**
 * Tags View 
 * 
 */
tv=
{
    /* Visibility */
    vRow:"table-row",
    vNone:"none",
    vCell:"table-cell",
    
    ssep:'&nbsp;',
    dsep:'&nbsp;&#8209;&nbsp;',
    header:'<th title=""></th>',
    detail:'<td colspan="6" class="detail">',
    param:'<span style="display:inline-block;">',
    tip:'<span class="tooltip">',
    tipVar:'<span class="tooltip cvar">', 
    tipText:'<span class="tooltiptext tooltip-right">',
    tree1:'<span class="treechild"></span>', 
    tree2:'<span class="treechild deep"></span>',
    nodeAttr : function(attr, value)
    {
        return ((value&&value!=='undefined')?(' '+attr+'="'+value+'"'):'');
    },
    /**
     * Create a table header cell node
     */
    nodeHeaderCell : function(content, className, title, display)
    {
        return ('<th'+tv.nodeAttr('class', className)+(display?tv.nodeAttr('style','display:'+display+';'):'')+tv.nodeAttr('title', title)+'>'+content+'</th>');
    },
    /**
     * Create a table row node
     */    
    nodeRow : function(content, className, visible, index)
    {
        var node=document.createElement("tr");
        node.style.display=(visible?tv.vRow:tv.vNone);
        node.className = className;             
        if (typeof index==='number')
        {  
            node.setAttribute('index',index.toString());
            node.title=trs.doubleclic;
        }       
        node.innerHTML = content;   
        return node; 
    },
    /**
     * Return non breakable string
     */    
    noBreak : function(s)
    {
        return (s?s.replace(/ /g,'&nbsp;').replace(/-/g,'&#8209'):'');
    },
    bold : function(s)
    {
        return s?('<b>'+s+'</b>'):'';  
    },
    warning : function(s)
    {
        return ("<span style='color:red;font-weight:normal;'>"+s+"</span>");
    }                
};