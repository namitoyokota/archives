using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GroceryBama
{
    class GROCERYSTORE
    {
        public GROCERYSTORE() { }

        public int store_id { get; set; }
        public string store_name { get; set; }
        public int address_id { get; set; }
        public string opening_time { get; set; }
        public string closing_time { get; set; }
        public string phone { get; set; }
    }
}
