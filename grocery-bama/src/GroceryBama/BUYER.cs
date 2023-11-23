using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GroceryBama
{
    class BUYER
    {
        public BUYER() { }

        public string username { get; set; }
        public string phone { get; set; }
        public int address { get; set; }
        public string default_payment { get; set; }
        public int default_store_id { get; set; }
    }
}
