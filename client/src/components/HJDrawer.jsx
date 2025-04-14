import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
  } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
  import { Input } from "@/components/ui/input"
import { useNavigate } from "react-router-dom"
import { createRoom, joinRoom } from "@/services/socketService"



const formSchema = z.object({
  username: z.string().min(2).max(50),
  password: z.string().min(2).max(50),
})


const HJDrawer = ({children, type}) => {
    const navigate = useNavigate();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
          username: "",
          password: "",
        },
      })

      // 2. Define a submit handler.
      function onSubmit(values) {
        if(type === 'Host') {
          createRoom(values);
          navigate(`/game/${values.username}-${values.password}`)
        }
        if (type === 'Join') {
          joinRoom(values);
          navigate(`/game/${values.username}-${values.password}`)
        }
      }



  return (
    <Drawer>
      <DrawerTrigger>{children}</DrawerTrigger>
      <DrawerContent className='h-auto min-h-[50vh] bg-black text-yellow-300 p-4 sm:p-6 lg:p-8'>
        <div className='container mx-auto max-w-md'>
          <div className='text-center mb-8 animate-in slide-in-from-top duration-500'>
            <h2 className='text-3xl sm:text-4xl font-spc mb-2'>{type} Game</h2>
            <p className='text-sm text-yellow-300/70'>Enter your credentials to {type.toLowerCase()} a game</p>
          </div>

          <div className='w-full animate-in fade-in duration-700 delay-200'>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                <FormField
                  control={form.control}
                  name='username'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-yellow-300'>Username</FormLabel>
                      <FormControl>
                        <Input
                          className='bg-gray-800/50 border-yellow-300/20 text-yellow-300 placeholder:text-yellow-300/50'
                          placeholder='Enter username'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className='text-red-400' />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-yellow-300'>Password</FormLabel>
                      <FormControl>
                        <Input
                          className='bg-gray-800/50 border-yellow-300/20 text-yellow-300 placeholder:text-yellow-300/50'
                          placeholder='Enter password'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className='text-red-400' />
                    </FormItem>
                  )}
                />
                <Button
                  type='submit'
                  className='w-full bg-yellow-300 text-black hover:bg-yellow-400 transition-colors py-6 text-lg font-medium'
                >
                  {type} Now
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default HJDrawer
