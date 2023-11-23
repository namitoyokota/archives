using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GroceryBama
{
    static class Globals
    {
        private static USER persistent_current;
        private static ADDRESS persistent_address;
        private static ADDRESS store_address;
        private static BUYER persistent_buyer;
        private static GROCERYSTORE persistent_store;
        private static GROCERYSTORE chosen_store;
        private static string preferred_credit;
        private static string preferred_routing;
        private static string chosen_item_lookup;
        private static string payment_name_used;
        public static string current_order;
        public static bool has_deleted;
        public static List<ITEM> cart = new List<ITEM>();

        public static USER Persistent_Current
        {
            get { return persistent_current; }
            set { persistent_current = value; }
        }

        public static ADDRESS Persistent_Address
        {
            get { return persistent_address; }
            set { persistent_address = value; }
        }
        public static ADDRESS Store_Address
        {
            get { return store_address; }
            set { store_address = value; }
        }
        public static BUYER Persistent_Buyer
        {
            get { return persistent_buyer; }
            set { persistent_buyer = value; }
        }
        public static GROCERYSTORE Persistent_Store
        {
            get { return persistent_store; }
            set { persistent_store = value; }
        }
        public static GROCERYSTORE Chosen_Store
        {
            get { return chosen_store; }
            set { chosen_store = value; }
        }
        public static string Preferred_Credit
        {
            get { return preferred_credit; }
            set { preferred_credit = value; }
        }
        public static string Preferred_Routing
        {
            get { return preferred_routing; }
            set { preferred_routing = value; }
        }
        public static string Payment_Name_Used
        {
            get { return payment_name_used; }
            set { payment_name_used = value; }
        }
        public static string Chosen_Item_Lookup
        {
            get { return chosen_item_lookup; }
            set { chosen_item_lookup = value; }
        }
    }
}
