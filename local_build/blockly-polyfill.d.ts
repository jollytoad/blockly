
declare namespace ಠ_ಠ.clutz {
    type GlobalElement = Element;
    type GlobalEvent = Event;
    type GlobalEventTarget = EventTarget;
    type GlobalObject = Object;
}

declare namespace ಠ_ಠ.clutz.Blockly {

    interface BlockStyle {
        [key: string]: string
    }

    interface CategoryStyle {
        [key: string]: string
    }

}

declare namespace ಠ_ಠ.clutz.goog.math {
    interface Coordinate {
        x: number
        y: number
    }
    interface Size {
        width: number
        height: number
    }
    interface Rect {
        left: number
        top: number
        width: number
        height: number
    }
}

declare namespace ಠ_ಠ.clutz.goog.dom {
    class DomHelper {
    }
}

declare namespace ಠ_ಠ.clutz.goog.ui {
    class Menu {
    }
    class MenuItem {
        getValue(): any
    }
}

declare namespace ಠ_ಠ.clutz.goog.ui.tree {
    class TreeControl {
    }
    class TreeNode {
    }
    class BaseNode {
    }
}

declare namespace ಠ_ಠ.clutz.goog.html {
    class SafeHtml {
    }
}

declare namespace ಠ_ಠ.clutz.goog.events {
    class BrowserEvent {
    }
}
