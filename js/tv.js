/******************************************************************************
 * @title Tags View
 * @author DENIS ROUSSEAU
 * @version 4.5
 ******************************************************************************/
/*jslint nomen: true, plusplus: true, regexp: true*/
tv=
{
    /* Visibility */
    vRow:"table-row",
    vNone:"none",
    vCell:"table-cell",
    vBlock:"block",
    
    ssep:'&nbsp;',
    dsep:'&nbsp;&#8209;&nbsp;',
    header:'<th title=""></th>',
    detail:'<td colspan="7" class="detail">',
    param:'<span style="display:inline-block;">',
    tip:'<span class="tooltip">',
    tipVar:'<span class="tooltip cvar">', 
    tipText:'<span class="tooltiptext tooltip-right">',
    tree1:'<span class="treechild"></span>', 
    tree2:'<span class="treechild deep"></span>',
    
    getNodeTableRow:function(node)
    {
        while (node && node.tagName!=='TR')
        {
            node=node.parentNode;
        } 
        return (node.tagName==='TR')?node:null;
    },
    getTableRowHeads:function(nodeRow, sep)
    {
        var i=0, ah=[], s='';
        if (nodeRow)
        {
            ah=nodeRow.querySelectorAll('th');
            for (i=0;i<ah.length;i++)
            {
                s+=(ah[i].textContent.replace(/\u00a0/g,' ')||'')+((i<ah.length-1)?sep:'');
            }
        }
        return s;
    },
    /**
     * Add an attribute to the node 
     */
    nodeAttr:function(attr, value)
    {
        return ((value&&value!=='undefined')?(' '+attr+'="'+value+'"'):'');
    },
    /**
     * Create a table header cell node
     */
    nodeHeaderCellType : function(content, className, title, display, icon)
    {
        if (icon)
        {
            content='<div style="display:flex;">'+content+'<span'+tv.nodeAttr('class', 'cchart cicon cghost')+'></span></div>';
        }
        return ('<th'+tv.nodeAttr('class', className)+(display?tv.nodeAttr('style','display:'+display+';'):'')+tv.nodeAttr('title', title)+'>'+content+'</th>');
    },
    /**
     * Create a table header cell node for URL
     */
    nodeHeaderCellUrl : function(content, className, title, display, url)
    {
        return ('<th'+tv.nodeAttr('class', className)+(display?tv.nodeAttr('style','display:'+display+';'):'')+'><a target="_blank" href="'+url+'"'+tv.nodeAttr('title', title)+'>'+content+'</a></th>');
    },    
    /**
     * Create a table header cell node
     */
    nodeHeaderCell : function(content, className, title, display, colspan)
    {
        return ('<th'+(className?tv.nodeAttr('class', className):'')+(display?tv.nodeAttr('style','display:'+display+';'):'')+tv.nodeAttr('title', title)+((colspan&&colspan>1)?tv.nodeAttr('colspan',colspan.toString()+';'):'')+'>'+content+'</th>');
    },  
    /**
     * Create an empty table header, possibly covering more than one column
     */    
    nodeHeaderCellEmpty : function(colspan)
    {
        return tv.nodeHeaderCell('','','','',colspan);
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